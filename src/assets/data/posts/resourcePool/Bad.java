private Response get(String request) throws Exception {
    Client client = new Client();
    return client.target(request).request().buildGet().invoke();
}        