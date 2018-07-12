@Test
public void testOpen() {
    User user = new User();
    user.getUsername();
}
@Test
public void testClosed() {
    ThreadAuthentication.set(null);
    User user = new User();
    try {
        user.getEmail();
    }
    catch (Exception e) {
        return;
    }
    Assert.fail();
}
@Test
public void testAuth() {
    ThreadAuthentication.set(Secured.SecurityLevel.ADMIN);
    User user = new User();
    user.getEmail();
}