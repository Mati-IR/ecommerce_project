package com.example.bazaar;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.Toast;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class NewAd {

    private Context context;

    public NewAd(Context context) {
        this.context = context;
    }

    public void submitForm() {
        SharedPreferences sharedPreferences = context.getSharedPreferences("UserData", Context.MODE_PRIVATE);
        int userId = sharedPreferences.getInt("userId", -1);

        String selectedCategoryName = "selected_category_name"; // Pobierz nazwę wybranej kategorii
        int selectedCategoryID = 123; // Pobierz identyfikator wybranej kategorii

        JSONObject newListingData = new JSONObject();
        try {
            newListingData.put("creator_id", userId);
            newListingData.put("title", "title"); // Pobierz tytuł wpisu z formularza
            newListingData.put("description", "description"); // Pobierz opis wpisu z formularza
            newListingData.put("price", 0.0); // Pobierz cenę wpisu z formularza
            newListingData.put("location", "location"); // Pobierz lokalizację wpisu z formularza
            newListingData.put("category_id", selectedCategoryID);
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
                        uploadImages(listingId); // Wyślij obrazy, jeśli są
                        clearForm();
                        displaySuccessMessage(); // Wyświetl komunikat o sukcesie
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
            int category_id = newListingData.getInt("category_id");

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