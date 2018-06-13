describe("Checking folderstatus", () -> {
    File fileMock = mock(File.class);
    beforeEach(() -> PowerMockito.whenNew(File.class).withAnyArguments().thenReturn(fileMock));
    describe("Has no files or folders in watch path", () -> {
        beforeEach(() -> when(fileMock.listFiles()).thenReturn(new File[0]));
        it("returns an empty list", () -> expect(underTest.getFolderStatus().isEmpty()).toBeTrue());
    });
    describe("Has no completed files or folders in watch path", () -> {
        beforeEach(() -> {
            File partMock = mock(File.class);
            File ignoreMock = mock(File.class);
            when(fileMock.listFiles()).thenReturn(new File[]{partMock, ignoreMock});
            when(ignoreMock.delete()).thenReturn(true);
            when(partMock.getPath()).thenReturn("xxxpart");
            when(ignoreMock.getPath()).thenReturn("xxxignore");
        });
        it("returns an empty list", () -> expect(underTest.getFolderStatus().isEmpty()).toBeTrue());
    });