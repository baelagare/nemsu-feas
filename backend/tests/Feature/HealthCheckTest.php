<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the health check endpoint returns 200 and operational status.
     */
    public function test_health_check_returns_operational_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'NEMSU-FEAS API service is operational.',
                'data' => [
                    'service' => 'NEMSU-FEAS API',
                    'version' => 'v1',
                    'database' => 'healthy',
                ],
            ]);
    }

    /**
     * Test CORS headers allow requests from Vite frontend.
     */
    public function test_cors_headers_allow_frontend_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
        ])->getJson('/api/v1/health');

        $response->assertStatus(200);
        $this->assertEquals(
            'http://localhost:5173',
            $response->headers->get('Access-Control-Allow-Origin')
        );
    }

    /**
     * Test non-existent API routes return consistent JSON 404 error format.
     */
    public function test_missing_route_returns_consistent_json_404(): void
    {
        $response = $this->getJson('/api/v1/non-existent-resource');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Endpoint or resource not found.',
            ]);
    }

    /**
     * Test protected routes return consistent JSON 401 error format when unauthenticated.
     */
    public function test_unauthenticated_api_request_returns_consistent_json_401(): void
    {
        $response = $this->getJson('/api/v1/user');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated. Institutional authorization token required.',
            ]);
    }
}
