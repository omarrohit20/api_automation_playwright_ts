import { test, expect, request } from '@playwright/test';
import { Booking } from '../../libs/booking';
import {
  verifyResponse,
  verifyResponseCode,
  verifyResponseIsSuccessful,
  verifyResponseMessageIncludes,
  verifyResponseTemplate
} from '../../libs/utils/assertions';

let booking: Booking;
let authToken: string;

test.describe('Restful Booker API', () => {
  test.beforeAll(async () => {
    booking = new Booking();

    const authResponseObj = await booking.authenticate(booking.authRequest.username, booking.authRequest.password);
    verifyResponseTemplate(authResponseObj, booking.authResponse, 200);
  });

  test('List bookings returns booking IDs array', async () => {
    const response = await booking.getBookingList();
    verifyResponseIsSuccessful(response);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('bookingid');
  });

  test('Create a new booking and validate response', async () => {
    const requestPayload = { ...booking.createBookingRequest, firstname: 'Rohit', lastname: 'omar' };
    const response = await booking.createBooking(requestPayload);
    const expectedResponse = { ...booking.createBookingResponse, firstname: 'Rohit', lastname: 'omar' };
    verifyResponseTemplate(response, expectedResponse, 200);
  });

  test('Get booking by created booking ID returns expected result', async () => {
    const createResponse = await booking.createBooking(booking.createBookingRequest);
    verifyResponseCode(createResponse, 200);

    const createBody = await createResponse.json();
    const bookingId = String(createBody.bookingid);

    const response = await booking.getBookingById(bookingId);
    verifyResponse(response, booking.getBookingResponse, 200);
  });

  test('Update a booking with full payload', async () => {
    const createResponse = await booking.createBooking(booking.createBookingRequest);
    verifyResponseCode(createResponse, 200);
    const bookingId = String((await createResponse.json()).bookingid);

    const updateResponse = await booking.updateBooking(bookingId, booking.updateBookingRequest);
    verifyResponseCode(updateResponse, 200);
    verifyResponseTemplate(updateResponse, booking.updateBookingResponse, 200);
  });

  test('Update a booking with partial payload still returns booking details', async () => {
    const createResponse = await booking.createBooking(booking.createBookingRequest);
    verifyResponseCode(createResponse, 200);
    const bookingId = String((await createResponse.json()).bookingid);

    const updateResponse = await booking.updateBooking(bookingId, booking.partialUpdateRequest);
    verifyResponseCode(updateResponse, 200);
    verifyResponseTemplate(updateResponse, booking.partialUpdateResponse, 200);
  });

  test('Delete a booking using auth token cookie', async () => {
    const createResponse = await booking.createBooking(booking.createBookingRequest);
    verifyResponseCode(createResponse, 200);
    const bookingId = String((await createResponse.json()).bookingid);

    const deleteResponse = await booking.deleteBooking(bookingId);
    verifyResponseCode(deleteResponse, 201);
  });
});
