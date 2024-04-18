package com.example.bazaar;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Marker;

public class DescriptionAdapter implements GoogleMap.InfoWindowAdapter {

    private final View mWindow;
    private String title;
    private String info;
    private Context mContext;

    public DescriptionAdapter(Context context, String title, String info) {
        mContext = context;
        mWindow = LayoutInflater.from(mContext).inflate(R.layout.activity_description, null);
        this.title = title;
        this.info = info;
    }

    private void renderWindowText(Marker marker, View view) {
        TextView tvTitle = view.findViewById(R.id.titleTextView);
        TextView tvInfo = view.findViewById(R.id.descriptionTextView);

        // Ustawienie tytułu ogłoszenia i dodatkowych informacji
        tvTitle.setText(title);
        tvInfo.setText(info);
    }

    @Override
    public View getInfoWindow(Marker marker) {
        renderWindowText(marker, mWindow);
        return mWindow;
    }

    @Override
    public View getInfoContents(Marker marker) {
        renderWindowText(marker, mWindow);
        return mWindow;
    }
}
