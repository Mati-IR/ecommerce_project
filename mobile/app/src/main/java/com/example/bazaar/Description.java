package com.example.bazaar;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;

public class Description extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private double latitude = 0.0; // Współrzędne geograficzne - szerokość
    private double longitude = 0.0; // Współrzędne geograficzne - długość
    private String title = "";
    private String description = "";
    private String price = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_description);

        // Pobranie danych z Intentu
        latitude = getIntent().getDoubleExtra("latitude", 0.0);
        longitude = getIntent().getDoubleExtra("longitude", 0.0);
        title = getIntent().getStringExtra("title");
        description = getIntent().getStringExtra("description");
        price = getIntent().getStringExtra("price");

        // Ustawienie tytułu aktywności
        setTitle(title);

        // Inicjalizacja mapy
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;

        // Przybliżenie kamery do lokalizacji ogłoszenia
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(latitude, longitude), 15));

        // Dodanie informacji o ogłoszeniu
        String info = "Opis: " + description + "\nCena: " + price;

        // Przekazanie dodatkowych informacji o ogłoszeniu do adaptera mapy
        mMap.setInfoWindowAdapter(new DescriptionAdapter(this, title, info));
    }
}
