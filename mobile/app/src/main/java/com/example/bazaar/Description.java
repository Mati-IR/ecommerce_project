package com.example.bazaar;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.LatLng;

public class Description extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private double latitude = 0.0; // Współrzędne geograficzne - szerokość
    private double longitude = 0.0; // Współrzędne geograficzne - długość
    private String title = "";
    private String description = "";
    private double price;

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_description);

        // Pobranie danych z Intentu
        latitude = getIntent().getDoubleExtra("latitude", 0.0);
        longitude = getIntent().getDoubleExtra("longitude", 0.0);
        title = getIntent().getStringExtra("title");
        description = getIntent().getStringExtra("description");
        price = getIntent().getDoubleExtra("price", -1);

        // Ustawienie tytułu aktywności
        setTitle(title);
        TextView tvTitle = findViewById(R.id.titleTextView);
        TextView tvInfo = findViewById(R.id.descriptionTextView);
        TextView tvPrice = findViewById(R.id.priceTextView);

        // Ustawienie tytułu ogłoszenia i dodatkowych informacji
        tvTitle.setText("Tytuł: " + title);
        tvInfo.setText("Opis: " + description);
        tvPrice.setText("Cena: " + price);
        // Inicjalizacja mapy
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        assert mapFragment != null;
        mapFragment.getMapAsync(this);
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;
        LatLng location = new LatLng(latitude, longitude);
        // Przybliżenie kamery do lokalizacji ogłoszenia
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(location, 14));

        CircleOptions circleOptions = new CircleOptions()
                .center(location)
                .radius(500) // Promień koła w metrach
                .strokeWidth(2)
                .strokeColor(getResources().getColor(R.color.round))
                .fillColor(getResources().getColor(R.color.fill)); // Kolor wypełnienia koła
        mMap.addCircle(circleOptions);

        // Dodanie informacji o ogłoszeniu
        DescriptionAdapter descriptionAdapter = new DescriptionAdapter(this, title, description, price);
        // Przekazanie dodatkowych informacji o ogłoszeniu do adaptera mapy
        mMap.setInfoWindowAdapter(descriptionAdapter);
    }
}
