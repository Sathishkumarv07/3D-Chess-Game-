import 'dart:convert';

class UserModel {
  final String id;
  final String username;
  final String email;
  final String avatarUrl;
  final int blitzElo;
  final int rapidElo;
  final int bulletElo;
  final int aiElo;
  final int totalGames;
  final int wins;
  final int losses;
  final int draws;
  final String provider; // 'google' or 'email'
  final DateTime loggedInAt;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.avatarUrl = '',
    this.blitzElo = 1540,
    this.rapidElo = 1720,
    this.bulletElo = 1910,
    this.aiElo = 2100,
    this.totalGames = 54,
    this.wins = 37,
    this.losses = 12,
    this.draws = 5,
    required this.provider,
    required this.loggedInAt,
  });

  double get winRate => totalGames > 0 ? (wins / totalGames) * 100 : 0.0;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'avatarUrl': avatarUrl,
      'blitzElo': blitzElo,
      'rapidElo': rapidElo,
      'bulletElo': bulletElo,
      'aiElo': aiElo,
      'totalGames': totalGames,
      'wins': wins,
      'losses': losses,
      'draws': draws,
      'provider': provider,
      'loggedInAt': loggedInAt.toIso8601String(),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? 'user_1',
      username: map['username'] ?? 'Player',
      email: map['email'] ?? 'player@chessx.com',
      avatarUrl: map['avatarUrl'] ?? '',
      blitzElo: map['blitzElo'] ?? 1540,
      rapidElo: map['rapidElo'] ?? 1720,
      bulletElo: map['bulletElo'] ?? 1910,
      aiElo: map['aiElo'] ?? 2100,
      totalGames: map['totalGames'] ?? 54,
      wins: map['wins'] ?? 37,
      losses: map['losses'] ?? 12,
      draws: map['draws'] ?? 5,
      provider: map['provider'] ?? 'email',
      loggedInAt: DateTime.tryParse(map['loggedInAt'] ?? '') ?? DateTime.now(),
    );
  }

  String toJson() => json.encode(toMap());
  factory UserModel.fromJson(String source) => UserModel.fromMap(json.decode(source));
}
