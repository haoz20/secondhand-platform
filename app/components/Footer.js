export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#91C8E4] to-[#F6F4EB] text-[#292524] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Team Members */}
          <div>
            <h3 className="text-xl font-bold mb-4 drop-shadow-sm text-[#285430]">Our Team</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="text-[#292524] font-medium">Swan Htet Aung</div>
              <div className="text-[#292524] font-medium">Thiri Htet</div>
              <div className="text-[#292524] font-medium">Kaung Myat San</div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-4 border-t border-[#292524]/20">
            <p className="text-[#292524]/80 drop-shadow-sm">
              © 2025 YaungWel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}