@RunWith(PowerMockRunner.class)
@PowerMockRunnerDelegate(OleasterRunner.class)
public class MyTest
{
    {
        describe("Has a created file", () -> {
            File file = new File("file.tmp");
            beforeEach(() -> file.createNewFile());
            it("returns true on checking", () -> expect(file.exists()).toBeTrue());
            describe("Has a deleted file", () -> {
                beforeEach(() -> file.delete());
                it("returns false on checking if it exists", () -> expect(file.exists()).toBeFalse());
            });
        });
    }
}