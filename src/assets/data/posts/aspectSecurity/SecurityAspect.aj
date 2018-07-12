public aspect SecurityAspect {
    @Before("execution(* *get*(..))")
    public void test(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        if(methodName.equals("get"))
            return;
        String fieldName = methodName.substring("get".length());
        fieldName = Character.toLowerCase(fieldName.charAt(0)) + fieldName.substring(1);
        try {
            Secured secured = joinPoint.getTarget().getClass().getDeclaredField(fieldName).getAnnotation(Secured.class);
            if(secured != null) {
                Secured.SecurityLevel value = secured.value();
                switch (value) {
                    case OPEN:
                        break;
                    case AUTHENTICATED:
                    case ADMIN:
                        if(ThreadAuthentication.get() != Secured.SecurityLevel.ADMIN)
                            throw new AccessDeniedException();
                }
            }
        } catch (NoSuchFieldException e) {
            throw new AccessDeniedException();
        }
    }
}