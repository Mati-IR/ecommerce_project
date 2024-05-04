package com.example.bazaar;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Request;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Objects;

public class ShowContent extends AppCompatActivity {

    private RecyclerView recyclerView;
    private AdvertisementAdapter adapter;
    private LinearLayoutManager layoutManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_show_content);
        int category = getIntent().getIntExtra("category", -1);
        if (category > 0) {
            showAds(category);
        }
    }


    public void showAds(int categoryId) {
        recyclerView = findViewById(R.id.recyclerView);
        layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        String url = "http://10.0.2.2:8000/listingsByCategory/" + categoryId + "/5";

        ArrayList<Advertisement> advertisements = new ArrayList<>();

        JsonArrayRequest request = new JsonArrayRequest(Request.Method.GET, url, null, jsonArray -> {
            // Tutaj uzyskaj dostęp do JSONArray i jego długości
            int arraySize = jsonArray.length();

            for (int i = 0; i < arraySize; i++) {
                try {
                    JSONObject object = jsonArray.getJSONObject(i);
                    final Advertisement ad = new Advertisement(object.getInt("id"),0, object.getString("title"), object.getString("description"), object.getString("location"), object.getDouble("price"), object.getString("creation_date"));
                    advertisements.add(ad);
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            }
            Log.d("Response", jsonArray.toString());
            adapter = new AdvertisementAdapter(advertisements);
            recyclerView.setAdapter(adapter);

        }, volleyError -> Log.d("Error", Objects.requireNonNull(volleyError.getMessage())));
        Volley.newRequestQueue(this).add(request);


    } // Tutaj należy utworzyć listę ogłoszeń i przypisać ją do adaptera

}

