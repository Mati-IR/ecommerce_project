package com.example.bazaar;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Marker;

public class DescriptionAdapter implements GoogleMap.InfoWindowAdapter {

    private final View mWindow;
    private String title;
    private String description;
    private Double price;
    private Context mContext;

    @SuppressLint("InflateParams")
    public DescriptionAdapter(Context context, String title, String description, double price) {
        mContext = context;
        mWindow = LayoutInflater.from(mContext).inflate(R.layout.activity_description, null);
        this.title = title;
        this.description = description;
        this.price = price;
    }

    @SuppressLint("SetTextI18n")
    private void renderWindowText(View view) {
        TextView tvTitle = view.findViewById(R.id.titleTextView);
        TextView tvInfo = view.findViewById(R.id.descriptionTextView);
        TextView tvPrice = view.findViewById(R.id.price);

        // Ustawienie tytułu ogłoszenia i dodatkowych informacji
        tvTitle.setText("Tytuł: " + title);
        tvInfo.setText("Opis: " + description);
        tvPrice.setText("Cena: " + price.toString());
    }

    @Override
    public View getInfoWindow(@NonNull Marker marker) {
        renderWindowText(mWindow);
        return mWindow;
    }

    @Override
    public View getInfoContents(@NonNull Marker marker) {
        renderWindowText(mWindow);
        return mWindow;
    }
}
