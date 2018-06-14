public void day() {
    shower();
    if(random.nextInt(10) > 1 || isSnowing())
        trainDelayed();
    comute();
    work(8);
    while(true)
        drink(new Coffe(Coffe.BLACK));
    comute();
    hobbyCoding();
    sleep(6);
}