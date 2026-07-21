import 'package:flutter/material.dart';
import '../widgets/dashboard_card.dart';
import 'pnr_screen.dart';
class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  String _greeting() {
    final hour = DateTime.now().hour;

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> features = [
      {"title": "PNR Status", "icon": Icons.confirmation_number},
      {"title": "Train Search", "icon": Icons.search},
      {"title": "Live Status", "icon": Icons.train},
      {"title": "Seat Availability", "icon": Icons.event_seat},
      {"title": "Platform", "icon": Icons.location_on},
      {"title": "Coach Position", "icon": Icons.view_stream},
      {"title": "Favourites", "icon": Icons.favorite},
      {"title": "Railway News", "icon": Icons.newspaper},
    ];

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              Text(
                _greeting(),
                style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 16,
                ),
              ),

              const SizedBox(height: 5),

              const Text(
                "RailSetu",
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: Color(0xff0D47A1),
                ),
              ),

              const Text(
                "Your Indian Railway Companion",
                style: TextStyle(
                  color: Colors.grey,
                ),
              ),

              const SizedBox(height: 20),

              TextField(
                decoration: InputDecoration(
                  hintText: "Search trains...",
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Expanded(
                child: GridView.builder(
                  itemCount: features.length,
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    childAspectRatio: 1.1,
                  ),
                                    itemBuilder: (context, index) {
                    return DashboardCard(
                      icon: features[index]["icon"],
                      title: features[index]["title"],
                      onTap: () {
                        if (features[index]["title"] == "PNR Status") {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const PnrScreen(),
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                "${features[index]["title"]} coming soon",
                              ),
                            ),
                          );
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
