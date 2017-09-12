package com.ionicframework.dbsampleionic131101;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.Fragment;

import java.util.List;

/**
 * Created by Tarak on 15-05-2017.
 */

public class PermissionHelper {

  public final static int GENERAL_PERMISSION = 110;
  public final static int CAMERA_PERMISSION = 120;
  public final static int CONTACT_PERMISSION = 130;
  public final static int LOCATION_PERMISSION = 140;
  public final static int PHONE_PERMISSION = 150;
  public final static int STORAGE_PERMISSION = 160;

  public static boolean hasCameraPermission(Activity activity){
    return ActivityCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
  }

  public static boolean hasContactsPermission(Activity activity){
    return ActivityCompat.checkSelfPermission(activity, Manifest.permission.GET_ACCOUNTS) == PackageManager.PERMISSION_GRANTED;
  }

  public static boolean hasLocationPermission(Context activity){
    return (ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
      && (ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED);
  }

  public static boolean hasPhonePermission(Activity activity){
    return ActivityCompat.checkSelfPermission(activity, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
  }

  public static boolean hasStoragePermission(Activity activity){
    return (ActivityCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED)
      && (ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED);
  }

  public static void requestCameraPermissions(Object activity){
    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
    else{
      ((Fragment)activity).requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
    }
//            FragmentCompat.requestPermissions((Fragment) activity, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
  }

  public static void requestContactsPermissions(Object activity){
    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, new String[]{Manifest.permission.GET_ACCOUNTS}, CONTACT_PERMISSION);
    else {
      ((Fragment)activity).requestPermissions(new String[]{Manifest.permission.GET_ACCOUNTS}, CONTACT_PERMISSION);
    }
  }

  public static void requestLocationPermissions(Object activity){
    String[] permission = new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION};
    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, permission, LOCATION_PERMISSION);
    else
      ((Fragment)activity).requestPermissions(permission, LOCATION_PERMISSION);
  }

  public static void requestPhonePermissions(Object activity){
    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, new String[]{Manifest.permission.READ_PHONE_STATE}, PHONE_PERMISSION);
    else
      ((Fragment)activity).requestPermissions( new String[]{Manifest.permission.READ_PHONE_STATE}, PHONE_PERMISSION);
  }

  public static void requestStoragePermissions(Object activity){
    String[] permission = new String[]{Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE};
    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, permission, STORAGE_PERMISSION);
    else
      ((Fragment)activity).requestPermissions( permission, STORAGE_PERMISSION);
  }

  public static void requestPermissions(Object activity, List<String> list){
    String[] permissions = new String[list.size()];

    for (int i =0; i<list.size(); i++){
      permissions[i] = list.get(i);
    }

    if (activity instanceof Activity)
      ActivityCompat.requestPermissions((Activity) activity, permissions, GENERAL_PERMISSION);
    else
      ((Fragment)activity).requestPermissions( permissions, GENERAL_PERMISSION);
  }
}
