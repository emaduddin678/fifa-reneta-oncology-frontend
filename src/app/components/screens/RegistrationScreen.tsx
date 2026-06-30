import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Briefcase,
  Building,
  MapPin,
  ChevronRight,
  Sparkles,
  Shield,
  Phone,
  Mail,
} from "lucide-react";
import PremiumBackground from "../PremiumBackground";
import { toast } from "sonner";
import image_Asset_1 from "@/imports/Asset_1.png";
import { completeRegistrationApi, updateStoredUser } from "@/app/lib/auth";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const districtsByDivision: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Faridpur",
    "Manikganj",
    "Munshiganj",
    "Narsingdi",
    "Kishoreganj",
    "Madaripur",
    "Gopalganj",
    "Rajbari",
    "Shariatpur",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Brahmanbaria",
    "Rangamati",
    "Noakhali",
    "Chandpur",
    "Lakshmipur",
    "Bandarban",
    "Khagrachhari",
  ],
  Rajshahi: [
    "Rajshahi",
    "Bogra",
    "Pabna",
    "Natore",
    "Sirajganj",
    "Naogaon",
    "Chapainawabganj",
    "Joypurhat",
  ],
  Khulna: [
    "Khulna",
    "Jessore",
    "Satkhira",
    "Bagerhat",
    "Kushtia",
    "Chuadanga",
    "Jhenaidah",
    "Magura",
    "Meherpur",
    "Narail",
  ],
  Barishal: [
    "Barishal",
    "Patuakhali",
    "Bhola",
    "Pirojpur",
    "Barguna",
    "Jhalokathi",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Kurigram",
    "Thakurgaon",
    "Panchagarh",
    "Nilphamari",
    "Lalmonirhat",
    "Gaibandha",
  ],
  Mymensingh: [
    "Mymensingh",
    "Jamalpur",
    "Netrokona",
    "Sherpur",
  ],
};

export default function RegistrationScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    speciality: "",
    institution: "",
    division: "",
    district: "",
  });
  const [loading, setLoading] = useState(false);

  const availableDistricts = formData.division
    ? districtsByDivision[formData.division]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.speciality ||
      !formData.institution ||
      !formData.division ||
      !formData.district
    )
      return;

    setLoading(true);
    try {
      const updatedUser = await completeRegistrationApi({
        name: formData.name,
        phone_number: formData.phone,
        email: formData.email || undefined,
        specialization: formData.speciality,
        institution_name_or_chamber_address: formData.institution,
        division: formData.division,
        district: formData.district,
      });
      updateStoredUser(updatedUser);
      toast.success("Profile completed successfully!");
      navigate("/home", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F7F5F0] to-[#EDE9E1] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <PremiumBackground />

      <div className="relative w-full max-w-lg">
        <div className="relative">
          <div className="relative bg-white/95 rounded-[2rem] p-6 sm:p-8 border border-black/15 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Rolac Logo */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <img
                  src={image_Asset_1}
                  alt="Rolac – Ketorolac Tromethamine USP"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>

              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#1E90FF]/20 to-[#667eea]/20 rounded-full border border-[#1E90FF]/30">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
                <span className="text-xs sm:text-sm text-[#1A1A2E]/90">
                  Complete Your Profile
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] mb-2">
                Welcome!
              </h2>
              <p className="text-[#1A1A2E]/70 text-sm sm:text-base">
                Please provide your details to continue
              </p>
            </div>

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              {/* Name */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 text-sm sm:text-base min-h-[48px]"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 text-sm sm:text-base min-h-[48px]"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Email(Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email address"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 text-sm sm:text-base min-h-[48px]"
                />
              </div>

              {/* Speciality */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Speciality
                </label>
                <input
                  type="text"
                  value={formData.speciality}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      speciality: e.target.value,
                    })
                  }
                  placeholder="Enter your speciality"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 text-sm sm:text-base min-h-[48px]"
                  required
                />
              </div>

              {/* Institution Name/Chamber Address */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Institution Name / Chamber Address
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institution: e.target.value,
                    })
                  }
                  placeholder="Enter institution or chamber address"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 text-sm sm:text-base min-h-[48px]"
                  required
                />
              </div>

              {/* Division */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Division
                </label>
                <select
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      division: e.target.value,
                      district: "",
                    })
                  }
                  className="w-full bg-white border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] focus:outline-none focus:border-[#1E90FF] text-sm sm:text-base min-h-[48px]"
                  required
                >
                  <option value="" className="">
                    Select Division
                  </option>
                  {divisions.map((division) => (
                    <option
                      key={division}
                      value={division}
                      className=""
                    >
                      {division}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      district: e.target.value,
                    })
                  }
                  className="w-full bg-white border-2 border-black/15 rounded-xl py-3 sm:py-4 px-4 text-[#1A1A2E] focus:outline-none focus:border-[#1E90FF] disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
                  disabled={!formData.division}
                  required
                >
                  <option value="" className="">
                    {formData.division
                      ? "Select District"
                      : "Select Division First"}
                  </option>
                  {availableDistricts.map((district) => (
                    <option
                      key={district}
                      value={district}
                      className=""
                    >
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  !formData.name ||
                  !formData.phone ||
                  !formData.speciality ||
                  !formData.institution ||
                  !formData.division ||
                  !formData.district ||
                  loading
                }
                className="relative w-full py-4 sm:py-5 bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-[#1A1A2E] font-bold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 min-h-[52px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-base sm:text-lg">
                  {loading ? "Saving…" : "Complete Registration"}
                  {!loading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                </span>
              </button>

              <p className="text-center text-[#1A1A2E]/50 text-xs sm:text-sm flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Your information is secure
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}