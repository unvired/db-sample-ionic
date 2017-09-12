/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.ionicframework.dbsampleionic131101;

import android.os.Bundle;
import org.apache.cordova.*;
import android.Manifest;

import com.unvired.exception.ApplicationException;
import com.unvired.login.LoginParameters;
import com.unvired.utils.FrameworkHelper;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        // Set by <content src="index.html" /> in config.xml
       
      LoginParameters.setContext(this);
    
    InputStream metaDataXmlStream = this.getResources().openRawResource(R.raw.metadata);
    String metaDataXml = null;
    try {
      metaDataXml = FrameworkHelper.getString(metaDataXmlStream);
    } catch (ApplicationException e) {

    }
    LoginParameters.setMetaDataXml(metaDataXml);
    LoginParameters.setContext(this);
    LoginParameters.setAppName("UnviredSAPSample");
    LoginParameters.setLoginTypes(new LoginParameters.LOGIN_TYPE[]{LoginParameters.LOGIN_TYPE.UNVIRED_ID});
    LoginParameters.setLoginScreenType(LoginParameters.LOGIN_SCREEN_TYPE.CUSTOM);
    checkForPermissions();
    loadUrl(launchUrl);
    }

      private void checkForPermissions() {

    List<String> permissionList = new ArrayList();

    if (!PermissionHelper.hasStoragePermission(this)) {
      permissionList.add(Manifest.permission.READ_EXTERNAL_STORAGE);
      permissionList.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
    }
    if (!PermissionHelper.hasPhonePermission(this)) {
      permissionList.add(Manifest.permission.READ_PHONE_STATE);
    }

    if (permissionList.size() > 0) {
      PermissionHelper.requestPermissions(this, permissionList);
    }
  }
}
