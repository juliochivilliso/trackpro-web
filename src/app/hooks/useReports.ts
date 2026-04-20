export type ReportPeriod = "today" | "week" | "month";

export function useReports() {
  const getReportData = (period: ReportPeriod) => {
    const kpiByPeriod = {
      today: [
        { label: "Kilómetros recorridos", value: "284 km",    delta: "+8% vs ayer" },
        { label: "Viajes completados",    value: "7",          delta: "+2 vs ayer" },
        { label: "Combustible consumido", value: "27 L",       delta: "-5% vs ayer" },
        { label: "Alertas generadas",     value: "4",          delta: "1 crítica" },
        { label: "Tiempo en ruta",        value: "46 h",       delta: "promedio 9.2h/vehículo" },
        { label: "Velocidad promedio",    value: "58 km/h",    delta: "máx registrada: 107 km/h" },
      ],
      week: [
        { label: "Kilómetros recorridos", value: "1,847 km",  delta: "+12% vs semana anterior" },
        { label: "Viajes completados",    value: "43",         delta: "+5 vs semana anterior" },
        { label: "Combustible consumido", value: "187 L",      delta: "-3% vs semana anterior" },
        { label: "Alertas generadas",     value: "29",         delta: "8 críticas" },
        { label: "Tiempo en ruta",        value: "312 h",      delta: "promedio 7.2h/vehículo" },
        { label: "Velocidad promedio",    value: "54 km/h",    delta: "máx registrada: 112 km/h" },
      ],
      month: [
        { label: "Kilómetros recorridos", value: "7,340 km",  delta: "+18% vs mes anterior" },
        { label: "Viajes completados",    value: "172",        delta: "+21 vs mes anterior" },
        { label: "Combustible consumido", value: "748 L",      delta: "+2% vs mes anterior" },
        { label: "Alertas generadas",     value: "114",        delta: "31 críticas" },
        { label: "Tiempo en ruta",        value: "1,248 h",    delta: "promedio 6.8h/vehículo" },
        { label: "Velocidad promedio",    value: "52 km/h",    delta: "máx registrada: 118 km/h" },
      ],
    };

    return {
      kpiCards: kpiByPeriod[period],
      weeklyKmChart: [
        { day: "Lun", km: 310 }, { day: "Mar", km: 285 }, { day: "Mié", km: 340 },
        { day: "Jue", km: 198 }, { day: "Vie", km: 420 }, { day: "Sáb", km: 180 },
        { day: "Dom", km: 114 },
      ],
      vehicleRanking: [
        { id: "T-02", name: "Toyota Hilux",        km: 412, trips: 11, fuel: 48 },
        { id: "T-01", name: "Honda Civic 2021",    km: 387, trips: 10, fuel: 32 },
        { id: "T-04", name: "Hyundai Sonata",      km: 325, trips:  9, fuel: 27 },
        { id: "T-05", name: "Suzuki Grand Vitara", km: 298, trips:  8, fuel: 24 },
        { id: "T-03", name: "Nissan Frontier",     km:  81, trips:  5, fuel: 14 },
      ],
      driverStats: [
        { driverId:"D-01", name:"Carlos Méndez",   trips:12, km:387, score:91,
          speedViolations:1, harshBraking:0, avgSpeed:52, fuelEff:"8.3 L/100km" },
        { driverId:"D-02", name:"María Santos",    trips:11, km:412, score:87,
          speedViolations:3, harshBraking:1, avgSpeed:58, fuelEff:"9.1 L/100km" },
        { driverId:"D-03", name:"José Rodríguez",  trips: 5, km: 81, score:79,
          speedViolations:2, harshBraking:2, avgSpeed:61, fuelEff:"7.9 L/100km" },
        { driverId:"D-04", name:"Ana Guzmán",      trips: 9, km:325, score:95,
          speedViolations:0, harshBraking:0, avgSpeed:49, fuelEff:"8.7 L/100km" },
        { driverId:"D-05", name:"Pedro Fernández", trips: 4, km:156, score:82,
          speedViolations:1, harshBraking:1, avgSpeed:55, fuelEff:"9.4 L/100km" },
        { driverId:"D-06", name:"Luisa Pérez",     trips: 2, km: 86, score:88,
          speedViolations:0, harshBraking:0, avgSpeed:51, fuelEff:"8.6 L/100km" },
      ],
      alertsByCategory: [
        { category:"OBD",        count:11, color:"purple" },
        { category:"Velocidad",  count: 8, color:"red"    },
        { category:"Motor",      count: 5, color:"orange" },
        { category:"Geocerca",   count: 3, color:"blue"   },
        { category:"Batería",    count: 1, color:"yellow" },
        { category:"Dispositivo",count: 1, color:"gray"   },
      ],
      alertsBySeverity: { critical: 8, warning: 15, info: 6 },
      topDtcCodes: [
        { code:"P0301", desc:"Fallo cilindro 1",      count:4, vehicle:"T-03 Nissan Frontier" },
        { code:"P0171", desc:"Mezcla pobre Banco 1",  count:3, vehicle:"T-02 Toyota Hilux"   },
        { code:"P0420", desc:"Catalizador deficiente", count:2, vehicle:"T-03 Nissan Frontier"},
        { code:"P0455", desc:"Fuga EVAP grande",       count:1, vehicle:"T-05 Suzuki G.V."   },
      ],
      dailyAlertTrend: [
        { day:"Lun",count:6 }, { day:"Mar",count:3 }, { day:"Mié",count:5 },
        { day:"Jue",count:4 }, { day:"Vie",count:7 }, { day:"Sáb",count:2 },
        { day:"Dom",count:2 },
      ],
      vehicleMaintenanceStatus: [
        { id:"T-01", name:"Honda Civic 2021",  odometer:45230, nextOilKm:45800,
          status:"PRÓXIMO",  dtcCount:0 },
        { id:"T-02", name:"Toyota Hilux",      odometer:78100, nextOilKm:80000,
          status:"OK",       dtcCount:1 },
        { id:"T-03", name:"Nissan Frontier",   odometer:112400,nextOilKm:107400,
          status:"VENCIDO",  dtcCount:3 },
        { id:"T-04", name:"Hyundai Sonata",    odometer:33500, nextOilKm:43500,
          status:"OK",       dtcCount:0 },
        { id:"T-05", name:"Suzuki G. Vitara",  odometer:15200, nextOilKm:20200,
          status:"OK",       dtcCount:1 },
      ],
      maintenanceSummary: { vencidos: 1, proximos: 1, alDia: 3 },
      upcomingServices: [
        { vehicle:"T-01 Honda Civic",     service:"Cambio de aceite",dueInKm: 570, urgency:"warning"  },
        { vehicle:"T-03 Nissan Frontier", service:"Bujías",          dueInKm:   0, urgency:"critical" },
        { vehicle:"T-03 Nissan Frontier", service:"Cambio de aceite",dueInKm:   0, urgency:"critical" },
        { vehicle:"T-02 Toyota Hilux",    service:"Filtro diesel",   dueInKm:2100, urgency:"info"     },
      ]
    };
  };

  return { getReportData };
}
