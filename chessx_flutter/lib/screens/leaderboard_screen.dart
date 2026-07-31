import 'package:flutter/material.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final topPlayers = [
      {'rank': '👑 #1', 'name': 'GrandmasterZero', 'elo': '2840 Elo', 'winRate': '78.4%'},
      {'rank': '🥈 #2', 'name': 'AlphaChess', 'elo': '2790 Elo', 'winRate': '74.2%'},
      {'rank': '🥉 #3', 'name': 'TacticsKing', 'elo': '2710 Elo', 'winRate': '71.0%'},
      {'rank': '#4', 'name': 'KnightRider', 'elo': '2450 Elo', 'winRate': '67.8%'},
      {'rank': '#5', 'name': 'PawnStorm', 'elo': '2320 Elo', 'winRate': '65.1%'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF161626),
        title: const Text('Global Leaderboard', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: topPlayers.length,
        itemBuilder: (context, index) {
          final p = topPlayers[index];
          return Card(
            color: const Color(0xFF1A1A2E),
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.white.withOpacity(0.08)),
            ),
            child: ListTile(
              leading: Text(p['rank']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFFDCB6E))),
              title: Text(p['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: Text(p['winRate']! + ' Win Rate', style: const TextStyle(color: Color(0xFF00B894))),
              trailing: Text(p['elo']!, style: const TextStyle(color: Color(0xFF00CEC9), fontFamily: 'Fira Code', fontWeight: FontWeight.bold)),
            ),
          );
        },
      ),
    );
  }
}
