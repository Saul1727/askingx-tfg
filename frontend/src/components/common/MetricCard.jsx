const MetricCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} text-white p-4 md:p-6 rounded-xl flex items-center gap-4 md:gap-6 shadow-md transition-transform hover:scale-[1.02] w-full min-w-0 break-words`}>
    <div className="bg-white/20 p-2 md:p-3 rounded-lg shrink-0 flex items-center justify-center">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs md:text-sm opacity-90 font-medium truncate" title={label}>{label}</p>
      <p className="text-2xl md:text-3xl font-bold truncate" title={value}>{value}</p>
    </div>
  </div>
);

export default MetricCard;
