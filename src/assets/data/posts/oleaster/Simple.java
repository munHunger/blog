describe("Has a created file", () -> {
    File file = new File("file.tmp");
    beforeEach(() -> file.createNewFile());
    it("returns true on checking", () -> expect(file.exists()).toBeTrue());
});