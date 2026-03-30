import { formatCurrency } from "@/lib/format";
import { placeCategoryLabel, type PlaceCategory } from "@/lib/places/place-categories";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Receipt,
  MapPinLine,
  Coins,
  CalendarBlank,
  AirplaneTilt,
  Bus,
  Car,
  Train,
  Bicycle,
  Boat,
  PersonSimpleWalk,
  NavigationArrow
} from "@phosphor-icons/react";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";

type ParticipantView = {
  id: string;
  name: string;
  avatar: string | null;
  tags: Array<{ id: string; label: string }>;
};

type ExpenseView = {
  id: string;
  title: string;
  notes: string | null;
  paidById: string;
  paidByName: string;
  splitType: "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";
  paymentMode: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER";
  category: string;
  customCategory: string | null;
  amount: number;
  currency: string;
  splits: Array<{
    userName: string;
    amount: number;
    percentageBp: number | null;
    shares: number | null;
  }>;
};

type VisitedPlaceView = {
  id: string;
  tripId: string;
  name: string;
  category: PlaceCategory;
  visitedAt: string;
  dayNumber: number | null;
  tags: string[];
  rating: number | null;
  notes: string | null;
  locationUrl: string | null;
  visitors: Array<{ id: string; name: string; avatar: string | null }>;
  ratings: Array<{ userId: string; userName: string; rating: number }>;
  media: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
};

type TripDashboardTabProps = {
  trip: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
    startPoint: string | null;
    dateFlexibility: "FIXED" | "MAY_CHANGE";
    transportMode: "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | null;
    transportNotes: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  participants: ParticipantView[];
  expenses: ExpenseView[];
  totalSpend: number;
  expenseByCategory: Array<{
    category: string;
    total: number;
    count: number;
    subcategories: Array<{ name: string; total: number; count: number }>;
  }>;
  totalVisitedPlaces: number;
  averagePlaceRating: number | null;
  timelinePlaces: VisitedPlaceView[];
};

function getTransportIcon(mode: string | null) {
  switch (mode) {
    case "FLIGHT": return <AirplaneTilt weight="fill" className="text-blue-500" />;
    case "TRAIN": return <Train weight="fill" className="text-orange-500" />;
    case "BUS": return <Bus weight="fill" className="text-emerald-500" />;
    case "CAR": return <Car weight="fill" className="text-indigo-500" />;
    case "BIKE": return <Bicycle weight="fill" className="text-rose-500" />;
    case "SHIP": return <Boat weight="fill" className="text-cyan-500" />;
    case "WALK": return <PersonSimpleWalk weight="fill" className="text-amber-500" />;
    default: return <NavigationArrow weight="fill" className="text-slate-500" />;
  }
}

export function TripDashboardTab({
  trip,
  participants,
  expenses,
  totalSpend,
  expenseByCategory,
  totalVisitedPlaces,
  averagePlaceRating,
  timelinePlaces,
}: TripDashboardTabProps) {
  // Pre-calculate colors for expense categories to make the progress bar look good
  const CATEGORY_COLORS = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-lime-500",
    "bg-blue-500",
    "bg-orange-500",
  ];

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HERO KPI RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-indigo-100 text-sm font-medium">Total Spend</span>
              <Coins className="w-5 h-5 text-indigo-200" weight="fill" />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalSpend)}</div>
              <div className="text-xs text-indigo-200 mt-1">{expenses.length} total expenses logged</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-sky-500 to-blue-600 text-white border-0 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-100 text-sm font-medium">Participants</span>
              <Users className="w-5 h-5 text-sky-200" weight="fill" />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight">{participants.length}</div>
              <div className="text-xs text-sky-200 mt-1">Active trip members</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-xl" />
          <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Places Visited</span>
              <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                <MapPinLine className="w-4 h-4" weight="bold" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight">{totalVisitedPlaces}</div>
              <div className="text-xs text-slate-500 mt-1">
                Avg rating: {averagePlaceRating ? averagePlaceRating.toFixed(1) : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 rounded-l-xl" />
          <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Status</span>
              <div className="p-1.5 bg-amber-100 rounded-md text-amber-600">
                <CalendarBlank className="w-4 h-4" weight="bold" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 tracking-tight capitalize">{trip.status.toLowerCase()}</div>
              <div className="text-xs text-slate-500 mt-1">
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "No start date"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* LEFT COLUMN: Financial Overview & Timeline */}
        <div className="grid gap-6">
          
          {/* Visual Financial Breakdown */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">Expense Breakdown</h3>
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                {expenseByCategory.length} Categories
              </Badge>
            </div>
            <CardContent className="p-5">
              {totalSpend === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <Coins className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-500">No expenses recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start adding expenses to see your spending breakdown.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Bar Widget */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Allocation</span>
                      <span className="font-bold text-slate-800">{formatCurrency(totalSpend)}</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                      {expenseByCategory.map((group, idx) => {
                        const percentage = (group.total / totalSpend) * 100;
                        const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                        return (
                          <div 
                            key={group.category} 
                            style={{ width: `${percentage}%` }}
                            className={`${colorClass} h-full transition-all duration-500 hover:brightness-110`}
                            title={`${group.category}: ${formatCurrency(group.total)}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {expenseByCategory.slice(0, 6).map((group, idx) => {
                      const percentage = ((group.total / totalSpend) * 100).toFixed(1);
                      const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                      return (
                        <div key={group.category} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 shadow-xs bg-white hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${colorClass} shadow-sm`} />
                            <div>
                              <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]" title={group.category}>
                                {group.category}
                              </p>
                              <p className="text-xs text-slate-400">{group.count} item(s)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">{formatCurrency(group.total)}</p>
                            <p className="text-xs font-medium text-slate-400">{percentage}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {expenseByCategory.length > 6 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        + {expenseByCategory.length - 6} more categories
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Places Timeline Condensed */}
          <Card className="border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MapPinLine className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Recent Places</h3>
              </div>
            </div>
            <CardContent className="p-0">
              {timelinePlaces.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                    <MapPinLine className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Your timeline is looking a bit empty.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {timelinePlaces.slice(-4).reverse().map((place, idx) => (
                    <div key={place.id} className="p-4 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-50" />
                        {idx !== Math.min(timelinePlaces.length, 4) - 1 && (
                          <div className="w-0.5 h-full min-h-[40px] bg-slate-100 mt-2 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{place.name}</p>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            {new Date(place.visitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{placeCategoryLabel(place.category)}</p>
                        {place.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {place.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                                {tag}
                              </span>
                            ))}
                            {place.tags.length > 3 && (
                               <span className="text-[10px] text-slate-400 px-1 py-0.5">+{place.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Trip Details & People */}
        <div className="grid gap-6 h-fit">
          
          {/* Trip Info Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-linear-to-b from-white to-slate-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl shadow-inner border border-indigo-100/50 shrink-0">
                  {getTransportIcon(trip.transportMode)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800 leading-tight truncate" title={trip.title}>
                    {trip.title}
                  </h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    {trip.startPoint || "Unknown departure"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CalendarBlank className="w-4 h-4 text-slate-400" />
                    Timeline
                  </span>
                  <span className="font-medium text-slate-700 text-right">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : "?"} 
                    {" "}-{" "} 
                    {trip.endDate ? new Date(trip.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : "?"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <NavigationArrow className="w-4 h-4 text-slate-400" />
                    Transport
                  </span>
                  <span className="font-medium text-slate-700 capitalize">
                    {trip.transportMode?.toLowerCase() || "Not set"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <AirplaneTilt className="w-4 h-4 text-slate-400" />
                    Flexibility
                  </span>
                  <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                    {trip.dateFlexibility.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              {trip.description && (
                <div className="mt-5 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3 italic">
                    "{trip.description}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members Overview */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-800">Trip Members</h3>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {participants.length} total
              </span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                {participants.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <img
                      src={p.avatar || DEFAULT_USER_AVATAR_URL}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">{p.name}</p>
                      <div className="flex gap-1 mt-0.5 overflow-hidden">
                        {p.tags.length === 0 ? (
                          <span className="text-[10px] text-slate-400">Traveler</span>
                        ) : (
                          p.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="text-[9px] uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-1.5 rounded border border-blue-100 whitespace-nowrap">
                              {tag.label}
                            </span>
                          ))
                        )}
                        {p.tags.length > 2 && (
                          <span className="text-[9px] text-slate-400 flex items-center">+{p.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
