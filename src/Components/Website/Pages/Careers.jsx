// import { motion } from "framer-motion";
// import { FaRocket, FaLightbulb, FaUsers, FaChartLine, FaGlassCheers, FaLayerGroup, FaTshirt, FaClock } from "react-icons/fa";

// const JoinOurTeam = () => {
//   // Animation variants
//   const container = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2
//       }
//     }
//   };

//   const item = {
//     hidden: { y: 30, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { 
//         type: "spring",
//         damping: 10,
//         stiffness: 100
//       }
//     }
//   };

//   const fadeIn = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1, 
//       transition: { 
//         duration: 0.8,
//         ease: "easeOut"
//       } 
//     }
//   };

//   return (
//     <motion.section 
//       className="py-20 px-6 bg-gradient-to-b from-gray-50 to-gray-100"
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, margin: "-50px" }}
//       variants={container}
//     >
//       <div className="max-w-5xl mx-auto">
//         {/* Hero Section */}
//         <motion.div className="text-center mb-20" variants={item}>
//           <motion.h1 
//             className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ 
//               type: "spring",
//               stiffness: 100,
//               damping: 10
//             }}
//           >
//             Craft the Future with <span className="text-indigo-600">ZiraTech</span>
//           </motion.h1>
//           <motion.p 
//             className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
//             variants={fadeIn}
//           >
//             Where innovation meets purpose. Join us in building technology that transforms businesses.
//           </motion.p>
//         </motion.div>

//         {/* Mission Section */}
//         <motion.div 
//           className="bg-white rounded-2xl shadow-sm p-10 mb-20 border border-gray-100"
//           variants={item}
//           whileHover={{ 
//             y: -5,
//             boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
//           }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <motion.div className="flex items-start mb-8" variants={item}>
//             <div className="bg-indigo-100 p-3 rounded-full mr-5">
//               <FaRocket className="text-indigo-600 text-xl" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">Meaningful Work</h2>
//               <div className="w-12 h-1 bg-indigo-500 mt-2 rounded-full"></div>
//             </div>
//           </motion.div>
          
//           <motion.p className="text-gray-600 text-lg leading-relaxed mb-6" variants={item}>
//             At ZiraTech, we blend technical excellence with human-centered design to create tools that empower businesses. We believe technology should simplify complexity, not add to it.
//           </motion.p>
          
//           <motion.div 
//             className="mt-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100"
//             variants={item}
//             whileHover={{ scale: 1.01 }}
//           >
//             <p className="text-gray-800">
//               <span className="font-medium">Ready to join us?</span> Send your portfolio to 
//               <span className="text-indigo-600 font-semibold"> careers@ziratech.com</span> with 
//               your vision for impactful technology.
//             </p>
//           </motion.div>
//         </motion.div>

//         {/* Culture Section */}
//         <motion.div className="mb-20" variants={item}>
//           <motion.div className="flex items-start mb-10" variants={item}>
//             <div className="bg-indigo-100 p-3 rounded-full mr-5">
//               <FaLightbulb className="text-indigo-600 text-xl" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">Our Philosophy</h2>
//               <div className="w-12 h-1 bg-indigo-500 mt-2 rounded-full"></div>
//             </div>
//           </motion.div>
          
//           <motion.div className="grid md:grid-cols-2 gap-8" variants={container}>
//             <motion.p className="text-gray-600 text-lg leading-relaxed" variants={item}>
//               We embrace "beautiful simplicity" - creating solutions that feel intuitive yet powerful. Our culture celebrates thoughtful experimentation, where every failure is a step toward innovation.
//             </motion.p>
//             <motion.p className="text-gray-600 text-lg leading-relaxed" variants={item}>
//               We value diverse perspectives and believe the best ideas emerge when passionate people collaborate. At ZiraTech, you'll grow both technically and personally through meaningful challenges.
//             </motion.p>
//           </motion.div>
//         </motion.div>

//         {/* Perks Section */}
//         <motion.div variants={item}>
//           <motion.div className="text-center mb-12" variants={item}>
//             <h3 className="text-2xl font-semibold text-gray-800 mb-3">Why You'll Love It Here</h3>
//             <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
//           </motion.div>
          
//           <motion.div 
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//             variants={container}
//           >
//             {[
//               { 
//                 icon: <FaChartLine className="text-indigo-600 text-2xl" />, 
//                 title: "Growth Path", 
//                 desc: "Structured mentorship and clear promotion tracks" 
//               },
//               { 
//                 icon: <FaClock className="text-indigo-600 text-2xl" />, 
//                 title: "Flexibility", 
//                 desc: "Hybrid work with focus on results, not hours" 
//               },
//               { 
//                 icon: <FaGlassCheers className="text-indigo-600 text-2xl" />, 
//                 title: "Celebrations", 
//                 desc: "Regular team events and milestone recognitions" 
//               },
//               { 
//                 icon: <FaLayerGroup className="text-indigo-600 text-2xl" />, 
//                 title: "Open Culture", 
//                 desc: "Flat hierarchy with direct access to leadership" 
//               },
//               { 
//                 icon: <FaUsers className="text-indigo-600 text-2xl" />, 
//                 title: "Diverse Team", 
//                 desc: "Collaborate with talented people across disciplines" 
//               },
//               { 
//                 icon: <FaTshirt className="text-indigo-600 text-2xl" />, 
//                 title: "Be Yourself", 
//                 desc: "Casual dress code and authentic self-expression" 
//               },
//             ].map((perk, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-all"
//                 variants={item}
//                 whileHover={{ 
//                   y: -8,
//                   boxShadow: "0 8px 20px -5px rgba(79, 70, 229, 0.1)"
//                 }}
//               >
//                 <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-5">
//                   {perk.icon}
//                 </div>
//                 <h4 className="font-semibold text-gray-800 text-lg mb-2">{perk.title}</h4>
//                 <p className="text-gray-600">{perk.desc}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </motion.div>
//       </div>
//     </motion.section>
//   );
// };

// export default JoinOurTeam;

// import React from "react";
// import { Container, Row, Col } from "react-bootstrap";
// import "./Pages.css";
// import joinIllustration from "../../assets/join-illustration.png";

// const Careers = ({
//   heroTitle = "Join the Team!",
//   heroSubtitle = "Ready to Help Change the Way Business is Run?",
//   illustrationSrc,
//   illustrationAlt = "Team collaboration illustration",
//   email = "contact@bookkeeper.com",
// }) => {
//   return (
//     <div className="careers-page-wrapper">
//       {/* Hero Banner */}
//       <section className="join-hero text-white text-center d-flex align-items-center justify-content-center">
//         <div className="py-5 py-md-6">
//           <h1 className="display-5 fw-bold mb-2">{heroTitle}</h1>
//           <p className="lead mb-0">{heroSubtitle}</p>
//         </div>
//       </section>

//       {/* Content */}
//       <section className="py-5 py-lg-7 join-content">
//         <Container>
//           <Row className="align-items-center gy-5">
//             {/* Text Column */}
//             <Col
//               md={6}
//               lg={5}
//               className="mx-auto mx-md-0 text-center text-md-start"
//             >
//               <h2 className="h1 fw-bold mb-4">Do Cool Things That Matter</h2>

//               <p className="text-body-secondary mb-3">
//                 We uphold a longstanding tradition of providing extraordinary
//                 customer service and building a product that helps save you
//                 time, because we know you went into business to pursue your
//                 passion and serve your customers—not to learn accounting.
//               </p>

//               <p className="text-body-secondary mb-3">
//                 We have lots of options for you. You’ll get the opportunity to
//                 learn, gain insight, have fun, and most importantly, get
//                 hands‑on experience solving real problems on real projects. We
//                 look for genuine passion and curiosity about technology,
//                 creative thinking, and the desire to work with startups.
//               </p>

//               <p className="text-body-secondary mb-0">
//                 If you’re interested in hitching your wagon to Book Keeper App,
//                 send your resume to{" "}
//                 <a href={`mailto:${email}`} className="link-primary">
//                   {email}
//                 </a>{" "}
//                 with a short note describing how you think you can help.
//               </p>
//             </Col>

//             {/* Illustration Column */}
//             <Col
//               md={6}
//               lg={{ span: 5, offset: 1 }}
//               className="text-center d-flex justify-content-center"
//             >
//               {illustrationSrc ? (
//                 <img
//                   src={illustrationSrczaX}
//                   alt={illustrationAlt}
//                   className="img-fluid join-illustration"
//                 />
//               ) : (
//                 <div className="ratio ratio-16x9 bg-body-secondary rounded-4 d-flex align-items-center justify-content-center w-100">
//                   <span className="text-body">Illustration</span>
//                 </div>
//               )}
//             </Col>
//           </Row>
//         </Container>
//       </section>
//     </div>
//   );
// };

// export default Careers;
