import 'package:flutter/material.dart';
import 'sub_screens.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.train, color: Colors.white),
            SizedBox(width: 8),
            Text('RailSetu', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const AboutScreen()),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Indian Railways Color Band banner
            Container(
              height: 6,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0x0D47A1), // Blue
                    Colors.white,
                    Color(0xFFFF9800), // Orange
                  ],
                  stops: [0.45, 0.5, 0.55],
                ),
              ),
            ),
            
            // Hero section with dynamic greeting card
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                color: const Color(0x0D47A1).withOpacity(0.05),
                elevation: 0,
                child: const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Color(0x0D47A1),
                        radius: 24,
                        child: Icon(Icons.support_agent, color: Colors.white),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome to RailSetu',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0x0D47A1),
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Information-only official companion for Indian Railways commuters. Ads free, login free.',
                              style: TextStyle(fontSize: 12, color: Colors.black54),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),

            // Feature Grid Header
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
              child: Text(
                'Railway Utilities',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),

            // Responsive Bento-style utilities grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0),
              child: GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 0.95,
                children: [
                  _buildMenuCard(
                    context, 
                    'PNR Status', 
                    Icons.contact_mail_rounded, 
                    const Color(0x0D47A1),
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PnrStatusScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Live Train', 
                    Icons.location_on_rounded, 
                    const Color(0xFFFF9800),
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveTrainScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Train Schedule', 
                    Icons.calendar_month_rounded, 
                    Colors.teal,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TrainScheduleScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Seats', 
                    Icons.event_seat_rounded, 
                    Colors.indigo,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SeatAvailabilityScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Fare Enquiry', 
                    Icons.currency_rupee_rounded, 
                    Colors.green,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FareEnquiryScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Coach Position', 
                    Icons.view_carousel_rounded, 
                    Colors.purple,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CoachPositionScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Platform Find', 
                    Icons.pin_drop_rounded, 
                    Colors.brown,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlatformLocatorScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Cancelled', 
                    Icons.cancel_rounded, 
                    Colors.red,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CancelledTrainsScreen())),
                  ),
                  _buildMenuCard(
                    context, 
                    'Diverted', 
                    Icons.alt_route_rounded, 
                    Colors.orange,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DivertedTrainsScreen())),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context, 
    String title, 
    IconData icon, 
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Card(
        elevation: 1,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                backgroundColor: color.withOpacity(0.12),
                radius: 20,
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 11, 
                  fontWeight: FontWeight.w600,
                  color: Colors.black80
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
