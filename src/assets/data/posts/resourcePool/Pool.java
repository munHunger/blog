public class SimpleClientResourcePool {
    private int clientpoolMaxConfig;

    private int maxPoolSize = 10000;

    private Client buildClient() {
        return new ResteasyClientBuilder()
                    .establishConnectionTimeout(30, TimeUnit.SECONDS)
                    .socketTimeout(30, TimeUnit.SECONDS)
                    .build();
    }

    private final Queue<Client> pool = new ConcurrentLinkedQueue<>();

    public Optional get() {
        return Optional.ofNullable(pool.poll());
    }

    public Client getOrDefault() {
        return (Client) get().orElse(buildClient());
    }

    public void release(Client value) {
        if (pool.size() < maxPoolSize)
            pool.offer(value);
    }
}
