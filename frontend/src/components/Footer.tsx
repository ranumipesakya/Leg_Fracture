import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {

  const footerLinks = {
    Product: [
      { label: 'Dashboard', href: '#/dashboard' },
      { label: 'Upload X-Ray', href: '#/upload' },
      { label: 'Physiotherapy', href: '#/physio' },
      { label: 'Recovery Progress', href: '#/recovery1' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 font-['Plus_Jakarta_Sans',_sans-serif]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
              </div>
              <span className="text-2xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">BoneScan AI</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium">
              Revolutionizing orthopedic care with advanced AI fracture detection and personalized recovery planning. Your health, our priority.
            </p>
            <div className="flex gap-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-[#3B82F6] dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] dark:hover:text-cyan-400 font-medium transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Keep in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#3B82F6] dark:text-cyan-400 shrink-0">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">support@bonescan.ai</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <FaPhone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">+94 789 573459</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 shrink-0">
                  <FaMapMarkerAlt className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium"> Homagama,Colombo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex justify-center items-center">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest text-center">
            © 2026 BoneScan AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
