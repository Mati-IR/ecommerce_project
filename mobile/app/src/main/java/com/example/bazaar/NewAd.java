package com.example.bazaar;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.telecom.Call;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.android.volley.Request;
import com.android.volley.toolbox.JsonObjectRequest;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.HttpCookie;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import okhttp3.Response;

public class NewAd extends AppCompatActivity {

    private Context context;
    private Spinner categorySpinner;

    EditText cityEditText;
    Button addImageButton;
    private ImageView imageView;
    ArrayList<Bitmap> imagesList = new ArrayList<>();
    private static final int PICK_IMAGE_REQUEST = 1;
    private static final int REQUEST_IMAGE_CAPTURE = 2;
    private static final int PICK_IMAGE_MULTIPLE = 3;
    @SuppressLint("IntentReset")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_ad);

        context = getApplicationContext();

        cityEditText = findViewById(R.id.city);
        addImageButton = findViewById(R.id.add_image_button);
        imageView = findViewById(R.id.imageView); // Initialize ImageView
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
        addImageButton = findViewById(R.id.add_image_button);
        addImageButton.setOnClickListener(v -> {
            selectImage();
        });
    }

    private void selectImage() {
        final CharSequence[] options = {"Take Photo", "Choose from Gallery", "Cancel"};
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(NewAd.this);
        builder.setTitle("Add Photo!");
        builder.setItems(options, (dialog, item) -> {
            if (options[item].equals("Take Photo")) {
                Intent takePicture = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                startActivityForResult(takePicture, REQUEST_IMAGE_CAPTURE);
            } else if (options[item].equals("Choose from Gallery")) {
                Intent pickPhoto = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                startActivityForResult(pickPhoto, PICK_IMAGE_MULTIPLE);
            } else if (options[item].equals("Cancel")) {
                dialog.dismiss();
            }
        });
        builder.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            if (requestCode == REQUEST_IMAGE_CAPTURE) {
                Bitmap imageBitmap = (Bitmap) data.getExtras().get("data");
                // Do something with the image captured from camera
            } else if (requestCode == PICK_IMAGE_MULTIPLE) {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    for (int i = 0; i < count; i++) {
                        Uri imageUri = data.getClipData().getItemAt(i).getUri();
                        // Do something with each selected image from gallery
                    }
                } else if (data.getData() != null) {
                    Uri imageUri = data.getData();
                    // Do something with selected image from gallery
                }
            }
        }
    }

    public void submitForm() throws JSONException {
        EditText cityEditText = findViewById(R.id.city);
        String city = cityEditText.getText().toString();

        if (city.isEmpty()) {
            Toast.makeText(context, "Please enter a city name", Toast.LENGTH_SHORT).show();
            return;
        }
        LatLng coords = getCoordinatesForCity(city);
        assert coords != null;
        String coordsString = coords.latitude + "," + coords.longitude;
        SharedPreferences sharedPreferences = getSharedPreferences("auth_data",MODE_PRIVATE);
        String user = sharedPreferences.getString("user", null);
        assert user != null;
        JSONObject juser = new JSONObject(user);
        EditText titleEditText = findViewById(R.id.title);
        EditText descriptionEditText = findViewById(R.id.description);
        EditText priceEditText = findViewById(R.id.price);

        String title = titleEditText.getText().toString();
        String description = descriptionEditText.getText().toString();
        double price = Double.parseDouble(priceEditText.getText().toString());
        String selectedCategory = String.valueOf(categorySpinner.getSelectedItemId());

        JSONObject newListingData = new JSONObject();
        try {
            newListingData.put("creator_id", juser.get("id"));
            newListingData.put("title", title);
            newListingData.put("description", description);
            newListingData.put("price", price);
            newListingData.put("location", coordsString);
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

            return true; // Zwróć true, jeśli dane są poprawne, w przeciwnym razie false
        } catch (JSONException e) {
            e.printStackTrace();
            return false; // Zwróć false w przypadku błędu parsowania danych
        }
    }
    private LatLng getCoordinatesForCity(String city) {
        Geocoder geocoder = new Geocoder(this);
        try {
            List<Address> addresses = geocoder.getFromLocationName(city, 1);
            if (addresses != null && !addresses.isEmpty()) {
                Address address = addresses.get(0);
                double latitude = address.getLatitude();
                double longitude = address.getLongitude();
                LatLng cityCoordinates = new LatLng(latitude, longitude);
                Log.d("City Coordinates", "City: " + city + ", Latitude: " + latitude + ", Longitude: " + longitude);
                return cityCoordinates;
            } else {
                Log.d("City Coordinates", "No coordinates found for city: " + city);
                return null;
            }
        } catch (IOException e) {
            Log.e("Geocoding Error", "Error obtaining coordinates for city: " + city, e);
        }
        return null;
    }

    private void uploadImages(int listingId) {
        ArrayList<Bitmap> images = getImages(); // Pobierz listę obrazów do wysłania

        for (int i = 0; i < images.size(); i++) {
            Bitmap image = images.get(i);
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            image.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
            byte[] imageData = byteArrayOutputStream.toByteArray();

            RequestBody requestBody = RequestBody.create(MediaType.parse("image/jpeg"), imageData);

            String url = "http://10.0.2.2:8000/uploadfile/" + listingId; // Endpoint do wysyłania obrazów
            okhttp3.Request request = new okhttp3.Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();
            try {
                Response response = client.newCall(request).execute();
                if (response.isSuccessful()) {
                    Log.d("Upload Images", "Image uploaded successfully for listing ID: " + listingId);
                    // Jeśli potrzebujesz, możesz dodać dodatkową logikę obsługi sukcesu
                } else {
                    Log.e("Upload Images", "Failed to upload image for listing ID: " + listingId);
                    // Jeśli potrzebujesz, możesz dodać dodatkową logikę obsługi błędu
                }
            } catch (Exception e) {
                e.printStackTrace();
                Log.e("Upload Images", "Exception while uploading image for listing ID: " + listingId + ", " + e.getMessage());
                // Obsłużenie wyjątku w przypadku niepowodzenia wysyłania obrazu
            }
        }
    }
    private ArrayList<Bitmap> getImages() {
        // Pobierz listę obrazów do wysłania (np. z zasobów, pamięci urządzenia, kamery itp.)
        // Tutaj zwrócę pustą listę, ale zaimplementuj odpowiednią logikę pobierania obrazów
        return new ArrayList<>();
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
