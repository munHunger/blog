@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Secured {
    SecurityLevel value();

    enum SecurityLevel {
        OPEN,
        AUTHENTICATED,
        ADMIN
    }
}