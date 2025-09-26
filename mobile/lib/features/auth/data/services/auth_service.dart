import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../config/constants.dart';
import '../../../../core/api/api_client.dart';
import '../models/auth_models.dart';

class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;

  AuthService({
    required ApiClient apiClient,
    required FlutterSecureStorage storage,
  }) : _apiClient = apiClient,
        _storage = storage;

  Future<AuthResponseModel> login(LoginDto loginDto) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/login',
        data: loginDto.toJson(),
      );

      final authResponse = AuthResponseModel.fromJson(response);

      // Save token and user data
      await _storage.write(
          key: AppConstants.authTokenKey,
          value: authResponse.token
      );

      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponseModel> register(RegisterDto registerDto) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/register',
        data: registerDto.toJson(),
      );

      final authResponse = AuthResponseModel.fromJson(response);

      // Save token
      await _storage.write(
          key: AppConstants.authTokenKey,
          value: authResponse.token
      );

      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.authTokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.authTokenKey);
    return token != null;
  }

  Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.authTokenKey);
  }
}