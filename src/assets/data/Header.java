public void day() {
    shower();
    if(random.nextInt(10) > 1 || isSnowing())
        train.delay();
    commute();
    work(8);
    while(true)
        drink(new Coffe(Coffe.BLACK));
    commute();
    hobbyCoding();
    sleep(6);
}