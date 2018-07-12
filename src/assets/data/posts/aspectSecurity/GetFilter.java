String methodName = joinPoint.getSignature().getName();
if(methodName.equals("get"))
    return;