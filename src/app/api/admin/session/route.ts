import { authJson } from "../../../../lib/auth/http";
import { AuthAccessError, requireAdmin } from "../../../../lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await requireAdmin();
    return authJson({ user: { id: user.id, email: user.email }, isAdmin: true });
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return authJson({ error: error.message }, error.status);
    }
    return authJson({ error: "Account access is temporarily unavailable." }, 503);
  }
}
