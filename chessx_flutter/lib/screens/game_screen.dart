import 'package:flutter/material.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({Key? key}) : super(key: key);

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  // Simple starting board grid representation
  final List<List<String>> _board = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
  ];

  final Map<String, String> _symbols = {
    'wP': '♙', 'wN': '♘', 'wB': '♗', 'wR': '♖', 'wQ': '♕', 'wK': '♔',
    'bP': '♟', 'bN': '♞', 'bB': '♝', 'bR': '♜', 'bQ': '♛', 'bK': '♚',
  };

  int? _selectedRow;
  int? _selectedCol;

  void _onSquareTap(int r, int c) {
    setState(() {
      if (_selectedRow == null) {
        if (_board[r][c].isNotEmpty) {
          _selectedRow = r;
          _selectedCol = c;
        }
      } else {
        // Move piece
        _board[r][c] = _board[_selectedRow!][_selectedCol!];
        _board[_selectedRow!][_selectedCol!] = '';
        _selectedRow = null;
        _selectedCol = null;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF161626),
        title: const Text('Chess Arena', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Opponent Clock Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: const Color(0xFF1A1A2E),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(radius: 16, child: Text('🤖', style: TextStyle(fontSize: 16))),
                    SizedBox(width: 10),
                    Text('AI Engine L5', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
                Text('05:00', style: TextStyle(color: Colors.white, fontFamily: 'Fira Code', fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // 8x8 Board Grid
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1.0,
                child: Container(
                  margin: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF4A2E16), width: 6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 8),
                    itemCount: 64,
                    itemBuilder: (context, index) {
                      final r = index ~/ 8;
                      final c = index % 8;
                      final isLight = (r + c) % 2 == 0;
                      final isSelected = _selectedRow == r && _selectedCol == c;
                      final piece = _board[r][c];

                      return GestureDetector(
                        onTap: () => _onSquareTap(r, c),
                        child: Container(
                          color: isSelected
                              ? const Color(0xFF00CEC9).withOpacity(0.6)
                              : (isLight ? const Color(0xFFE0C9A6) : const Color(0xFF8B5A2B)),
                          child: Center(
                            child: Text(
                              _symbols[piece] ?? '',
                              style: TextStyle(
                                fontSize: 32,
                                color: piece.startsWith('w') ? Colors.white : Colors.black,
                                shadows: const [Shadow(blurRadius: 4, color: Colors.black45)],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),

          // Player Clock Footer
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: const Color(0xFF1A1A2E),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(radius: 16, child: Text('👤', style: TextStyle(fontSize: 16))),
                    SizedBox(width: 10),
                    Text('You', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
                Text('05:00', style: TextStyle(color: Color(0xFFFDCB6E), fontFamily: 'Fira Code', fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
