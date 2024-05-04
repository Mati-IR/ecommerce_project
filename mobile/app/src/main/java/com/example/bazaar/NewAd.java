package com.example.bazaar;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.PixelCopy;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.android.volley.Request;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.JsonRequest;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class NewAd extends AppCompatActivity implements OnMapReadyCallback, LocationListener {

    private Context context;
    private GoogleMap mMap;
    private Marker marker;
    private Spinner categorySpinner;

    private static final int PERMISSION_REQUEST_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_ad);

        context = getApplicationContext();

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        assert mapFragment != null;
        mapFragment.getMapAsync(this);

        EditText addressEditText = findViewById(R.id.address);
        addressEditText.setEnabled(false);
        ArrayList<String> categories = getIntent().getStringArrayListExtra("categories");
        categorySpinner = findViewById(R.id.category);
        assert categories != null;
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, categories);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        categorySpinner.setAdapter(adapter);

        Button submitButton = findViewById(R.id.submit_button);
        submitButton.setOnClickListener(v -> {
            try {
                submitForm();
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchCurrentLocation();
        } else {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;

        // Ustaw domyślną lokalizację na mapie
        fetchCurrentLocation();
        // Obsługa przesuwania markera na mapie
        mMap.setOnMarkerDragListener(new GoogleMap.OnMarkerDragListener() {
            @Override
            public void onMarkerDragStart(Marker marker) {}

            @Override
            public void onMarkerDrag(Marker marker) {}

            @Override
            public void onMarkerDragEnd(Marker marker) {
                LatLng newPosition = marker.getPosition();
                // Aktualizacja adresu w EditText na podstawie nowej pozycji markera
                updateAddress(newPosition);
            }
        });

        // Obsługa kliknięć na mapie
        mMap.setOnMapClickListener(new GoogleMap.OnMapClickListener() {
            @Override
            public void onMapClick(LatLng latLng) {
                // Ustawienie nowej pozycji znacznika na kliknięcie mapy
                marker.setPosition(latLng);
                // Aktualizacja adresu w EditText na podstawie nowej pozycji
                updateAddress(latLng);
            }
        });
    }

    @Override
    public void onLocationChanged(Location location) {}

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {}

    @Override
    public void onProviderDisabled(String provider) {}

    private void updateAddress(LatLng latLng) {
        EditText addressEditText = findViewById(R.id.address);
        String strLoc = latLng.latitude + ", " + latLng.longitude;
        addressEditText.setText(strLoc);
        // Aktualizacja lokalizacji w polu EditText
        mMap.animateCamera(CameraUpdateFactory.newLatLng(latLng));
    }
    public void submitForm() throws JSONException {
        SharedPreferences sharedPreferences = getSharedPreferences("auth_data",MODE_PRIVATE);
        String user = sharedPreferences.getString("user", null);
        assert user != null;
        JSONObject juser = new JSONObject(user);
        EditText titleEditText = findViewById(R.id.title);
        EditText descriptionEditText = findViewById(R.id.description);
        EditText priceEditText = findViewById(R.id.price);
        EditText addressEditText = findViewById(R.id.address);

        String title = titleEditText.getText().toString();
        String description = descriptionEditText.getText().toString();
        double price = Double.parseDouble(priceEditText.getText().toString());
        String address = addressEditText.getText().toString();
        String selectedCategory = String.valueOf(categorySpinner.getSelectedItemId());

        JSONObject newListingData = new JSONObject();
        try {
            newListingData.put("creator_id", juser.get("id"));
            newListingData.put("title", title);
            newListingData.put("description", description);
            newListingData.put("price", price);
            newListingData.put("location", address);
            newListingData.put("category_id", selectedCategory);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        Log.d("listing",newListingData.toString());
        if (!validateFormData(newListingData)) {
            return;
        }

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, "http://10.0.2.2:8000" + "/create_listing", newListingData,
                response -> {
                    try {
                        int listingId = response.getInt("listing");
                        Log.d("Listing ID", "Listing ID: " + listingId);
                        uploadImages(listingId);
                        clearForm();
                        displaySuccessMessage();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                },
                error -> {
                    Log.e("Error", "Error creating listing: " + error.getMessage());
                    Toast.makeText(context, "Error creating listing!", Toast.LENGTH_SHORT).show();
                }) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                return headers;
            }
        };

        VolleySingleton.getInstance(context).addToRequestQueue(request);
    }

    private boolean validateFormData(JSONObject newListingData) {
        // Tutaj dodaj logikę walidacji danych formularza
        try {
            String title = newListingData.getString("title");
            String description = newListingData.getString("description");
            double price = newListingData.getDouble("price");
            String location = newListingData.getString("location");
            //String category = newListingData.getString("category");

            // Tutaj możesz dodać dodatkowe warunki walidacji

            return true; // Zwróć true, jeśli dane są poprawne, w przeciwnym razie false
        } catch (JSONException e) {
            e.printStackTrace();
            return false; // Zwróć false w przypadku błędu parsowania danych
        }
    }

    private void uploadImages(int listingId) {
        // Tutaj dodaj logikę wysyłania obrazów na serwer
        // W tym przykładzie jest pusta
        Log.d("Upload Images", "Uploading images for listing ID: " + listingId);
    }

    private void clearForm() {
        // Tutaj dodaj logikę czyszczenia formularza
        // W tym przykładzie jest pusta
        Log.d("Clear Form", "Clearing form data");
    }

    private void displaySuccessMessage() {
        // Tutaj dodaj logikę wyświetlania komunikatu o sukcesie
        Toast.makeText(context, "Listing created successfully!", Toast.LENGTH_SHORT).show();
    }
    private void fetchCurrentLocation() {
        LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if (locationManager != null) {
            // Sprawdź, czy uzyskano uprawnienia do dostępu do lokalizacji
            if (ContextCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                // Uzyskaj aktualną lokalizację użytkownika
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, new LocationListener() {
                    @Override
                    public void onLocationChanged(@NonNull Location location) {
                        // Tutaj możesz użyć lokalizacji location.getLatitude() i location.getLongitude()
                        LatLng currentLocation = new LatLng(location.getLatitude(), location.getLongitude());
                        marker = mMap.addMarker(new MarkerOptions().position(currentLocation).draggable(true));

                        // Przybliżenie kamery do aktualnej lokalizacji
                        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLocation, 15));
                    }

                    @Override
                    public void onProviderEnabled(@NonNull String provider) {}

                    @Override
                    public void onProviderDisabled(@NonNull String provider) {}

                    @Override
                    public void onStatusChanged(String provider, int status, Bundle extras) {}
                });
            } else {
                // Poproś użytkownika o uprawnienia dostępu do lokalizacji
                ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_REQUEST_CODE);
            }
        }
    }
}
