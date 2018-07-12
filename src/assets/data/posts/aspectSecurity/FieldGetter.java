String fieldName = methodName.substring("get".length());
fieldName = Character.toLowerCase(fieldName.charAt(0)) + fieldName.substring(1);
try {
    Secured secured = joinPoint.getTarget().getClass().getDeclaredField(fieldName).getAnnotation(Secured.class);