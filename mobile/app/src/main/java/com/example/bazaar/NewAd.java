package com.example.bazaar;

import android.content.Context;
import android.content.SharedPreferences;
import android.location.Location;
import android.location.LocationListener;
import android.os.Bundle;
import android.util.Log;
import android.view.PixelCopy;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.compose.foundation.gestures.ContentInViewNode;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_ad);

        context = this;

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
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
        submitButton.setOnClickListener(v -> submitForm());
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Ustaw domyślną lokalizację na mapie
        LatLng defaultLocation = new LatLng(0, 0);
        marker = mMap.addMarker(new MarkerOptions().position(defaultLocation).draggable(true));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 15));

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
        // Tutaj można użyć usług geokodowania, aby przetłumaczyć współrzędne na adres
        EditText addressEditText = findViewById(R.id.address);
        addressEditText.setText(latLng.latitude + ", " + latLng.longitude);
    }

    public void submitForm() {
        SharedPreferences sharedPreferences = context.getSharedPreferences("UserData", Context.MODE_PRIVATE);
        int userId = sharedPreferences.getInt("userId", -1);

        EditText titleEditText = findViewById(R.id.title);
        EditText descriptionEditText = findViewById(R.id.description);
        EditText priceEditText = findViewById(R.id.price);
        EditText addressEditText = findViewById(R.id.address);

        String title = titleEditText.getText().toString();
        String description = descriptionEditText.getText().toString();
        double price = Double.parseDouble(priceEditText.getText().toString());
        String address = addressEditText.getText().toString();
        String selectedCategory = categorySpinner.getSelectedItem().toString();

        JSONObject newListingData = new JSONObject();
        try {
            newListingData.put("creator_id", userId);
            newListingData.put("title", title);
            newListingData.put("description", description);
            newListingData.put("price", price);
            newListingData.put("location", address);
            newListingData.put("category", selectedCategory);
        } catch (JSONException e) {
            e.printStackTrace();
        }

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
            String category = newListingData.getString("category");

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
}
