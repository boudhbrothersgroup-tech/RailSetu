import 'package:flutter/material.dart';

class PnrScreen extends StatefulWidget {
  const PnrScreen({super.key});

  @override
  State<PnrScreen> createState() => _PnrScreenState();
}

class _PnrScreenState extends State<PnrScreen> {
  final TextEditingController pnrController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("PNR Status"),
        backgroundColor: Colors.blue,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: pnrController,
              keyboardType: TextInputType.number,
              maxLength: 10,
              decoration: const InputDecoration(
                labelText: "Enter 10 Digit PNR",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        "Searching PNR: ${pnrController.text}",
                      ),
                    ),
                  );
                },
                child: const Text("Check PNR"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
