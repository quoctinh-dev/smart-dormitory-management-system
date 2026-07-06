package com.sdms.backend.modules.smartaccess.security;

public final class SmartAccessPermissions {
    
    private SmartAccessPermissions() {}

    // STRICT GOVERNANCE: 
    // No "ROLE_ADMIN" checks. Granular capabilities only.
    // Capabilities are mapped dynamically in UserAccount based on Role.
    public static final String MANAGE_CURFEW_POLICY = "hasAuthority('MANAGE_CURFEW_POLICY')";
    public static final String MANAGE_TIME_WINDOW_POLICY = "hasAuthority('MANAGE_TIME_WINDOW_POLICY')";
    public static final String VIEW_ACCESS_HISTORY = "hasAuthority('VIEW_ACCESS_HISTORY')";
    public static final String REMOTE_UNLOCK = "hasAuthority('REMOTE_UNLOCK')";
    public static final String EMERGENCY_OVERRIDE = "hasAuthority('EMERGENCY_OVERRIDE')";
}
