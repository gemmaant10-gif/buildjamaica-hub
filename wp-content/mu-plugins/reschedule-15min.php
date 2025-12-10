<?php
/**
 * MU plugin: add a 15-minute cron schedule and reschedule selected hooks to use it.
 *
 * Drop this file into wp-content/mu-plugins/reschedule-15min.php
 * It will run on init and reschedule the hooks once (uses a transient to avoid repeating).
 *
 * Safe to keep as a small mu-plugin; remove after verification if you prefer.
 */

if ( ! defined( 'WPINC' ) ) {
    return;
}

// Add 15-minute schedule
add_filter( 'cron_schedules', function ( $schedules ) {
    if ( ! isset( $schedules['fifteen_minutes'] ) ) {
        $schedules['fifteen_minutes'] = array(
            'interval' => 900, // 900 seconds = 15 minutes
            'display'  => 'Every 15 Minutes',
        );
    }
    return $schedules;
} );

// Reschedule selected hooks once (uses transient to avoid repeated work)
add_action( 'init', function () {
    // Only run once per hour to be safe
    if ( get_transient( 'reschedule_15min_done' ) ) {
        return;
    }

    // List hooks to reschedule. Update this array if you need to target different hooks.
    $hooks = array(
        'nfd_data_sync_cron',
        'action_scheduler_run_queue',
    );

    foreach ( $hooks as $hook ) {
        // Unschedule any existing occurrences of the hook
        while ( $timestamp = wp_next_scheduled( $hook ) ) {
            wp_unschedule_event( $timestamp, $hook );
        }

        // Schedule using the 15-minute interval if not already scheduled
        if ( ! wp_next_scheduled( $hook ) ) {
            wp_schedule_event( time(), 'fifteen_minutes', $hook );
            if ( function_exists( 'error_log' ) ) {
                error_log( "[reschedule-15min] scheduled {$hook} to run every 15 minutes" );
            }
        }
    }

    // Mark done for an hour
    set_transient( 'reschedule_15min_done', 1, HOUR_IN_SECONDS );
} );
