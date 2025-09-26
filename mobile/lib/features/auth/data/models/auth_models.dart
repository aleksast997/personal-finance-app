import 'package:equatable/equatable.dart';

class LoginDto extends Equatable {
  final String email;
  final String password;

  const LoginDto({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
  };

  @override
  List<Object?> get props => [email, password];
}

class RegisterDto extends Equatable {
  final String email;
  final String password;
  final String firstName;
  final String lastName;

  const RegisterDto({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'firstName': firstName,
    'lastName': lastName,
  };

  @override
  List<Object?> get props => [email, password, firstName, lastName];
}

class UserModel extends Equatable {
  final String id;
  final String email;
  final String firstName;
  final String lastName;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
    );
  }

  String get fullName => '$firstName $lastName';

  @override
  List<Object?> get props => [id, email, firstName, lastName];
}

class AuthResponseModel extends Equatable {
  final UserModel user;
  final String token;

  const AuthResponseModel({
    required this.user,
    required this.token,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
      token: json['token'] as String? ?? '',
    );
  }

  @override
  List<Object?> get props => [user, token];
}