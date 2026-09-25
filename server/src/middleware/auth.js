const { clerkMiddleware, clerkClient, getAuth } = require("@clerk/express");
const prisma = require("../lib/prisma");
const { COMPONENTS, FAILURE_MODES, COMPLIANCE_CLAUSES } = require("../lib/seedData");

// ============================================================================
// ⚠️ TEMPORARY AUTH BYPASS — set BYPASS_AUTH=true in server/.env to skip Clerk
// session verification entirely while the Google OAuth redirect issue (see
// project notes) is being worked out. Every request is treated as one fixed
// dev user/workspace instead. Email/password sign-in through Clerk is
// untouched and still works normally when this flag is off.
// To re-enable real auth: remove BYPASS_AUTH from server/.env (or set it to
// anything other than "true").
// ============================================================================
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";
const BYPASS_CLERK_USER_ID = "dev-bypass-user";
if (BYPASS_AUTH) {
  console.warn(
    "\n⚠️  BYPASS_AUTH is enabled — all requests are treated as a single dev user. Do not use this outside local development.\n"
  );
}

// A brand-new sign-in fires several requests in parallel (see the frontend's
// loadAll()), all hitting this middleware for the same clerkUserId before any
// of them has finished creating that user's row + personal workspace. Without
// serializing, they'd race on the DB (unique constraint violation on the user,
// or duplicate workspaces since nothing else stops two of them succeeding at
// "no workspace yet, so create one"). This in-flight cache makes concurrent
// requests for the same not-yet-provisioned user await the same promise
// instead of each attempting provisioning themselves.
const provisioningInFlight = new Map();

async function resolveUserAndWorkspace(clerkUserId) {
  let user = await prisma.user.findUnique({ where: { clerkUserId } });

  if (!user) {
    let email = "unknown@example.com";
    let name = null;

    if (clerkUserId === BYPASS_CLERK_USER_ID) {
      email = "dev-bypass@localhost";
      name = "Dev Bypass User";
    } else {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      email =
        (clerkUser.emailAddresses &&
          clerkUser.emailAddresses[0] &&
          clerkUser.emailAddresses[0].emailAddress) ||
        email;
      name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    }

    // upsert (not create) so this is safe even if another process/instance
    // created the same clerkUserId a moment ago.
    user = await prisma.user.upsert({
      where: { clerkUserId },
      create: { clerkUserId, email, name },
      update: {},
    });
  }

  let membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  });

  if (!membership) {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || user.email}'s Workspace`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: "owner" } },
        failureModes: {
          create: FAILURE_MODES.map((fm) => ({
            ...fm,
            createdById: user.id,
          })),
        },
        compliance: { create: COMPLIANCE_CLAUSES },
      },
    });
    await prisma.auditLogEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        text: "Workspace created and seeded with the default ultrasound-probe FMEA dataset.",
      },
    });
    membership = { workspace, userId: user.id };
  }

  return { user, workspace: membership.workspace };
}

// Verifies the Clerk session token, then resolves (or provisions) our own
// User + a personal Workspace for them — see Knowledge Base §2.3.
// Attaches req.user and req.workspace for every downstream route.
async function provisionUser(req, res, next) {
  let clerkUserId;
  if (BYPASS_AUTH) {
    clerkUserId = BYPASS_CLERK_USER_ID;
  } else {
    ({ userId: clerkUserId } = getAuth(req));
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized — no session" });
    }
  }

  try {
    let inFlight = provisioningInFlight.get(clerkUserId);
    if (!inFlight) {
      inFlight = resolveUserAndWorkspace(clerkUserId).finally(() => {
        provisioningInFlight.delete(clerkUserId);
      });
      provisioningInFlight.set(clerkUserId, inFlight);
    }

    const { user, workspace } = await inFlight;
    req.user = user;
    req.workspace = workspace;
    next();
  } catch (e) {
    console.error("Auth/provisioning error:", e);
    res.status(500).json({ error: "Internal error resolving user" });
  }
}

module.exports = { requireUser: provisionUser, clerkMiddleware, COMPONENTS };
