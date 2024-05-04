package com.example.bazaar;

public class Advertisement {
    private int imageResource;
    private String title;
    private String description;
    private String location;
    private Double price;
    private String date;

    private int id;

    public Advertisement(int id, int imageResource, String title, String description, String location, Double price, String date) {
        this.imageResource = imageResource;
        this.title = title;
        this.description = description;
        this.location = location;
        this.price = price;
        this.date = date;
        this.id = id;
    }

    public int getImageResource() {
        return imageResource;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getlocation() {
        return location;
    }

    public Double getPrice() {
        return price;
    }

    public String getDate() {
        return date;
    }
}
