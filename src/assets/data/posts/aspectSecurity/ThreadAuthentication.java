public class ThreadAuthentication {
    private static final ThreadLocal<Secured.SecurityLevel> securityLevel = ThreadLocal.withInitial(() -> null);
    public static void set(Secured.SecurityLevel level) {
        securityLevel.set(level);
    }
    public static Secured.SecurityLevel get() {
        return securityLevel.get();
    }
}
