

export function tableToCsv(clubName: string) {
  var csv_data: any[] | string = [];
 
  var rows = document.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
      var cols = rows[i].querySelectorAll('.tdGet,.thGet, .tdGetCheckbox input[type="checkbox"]');
      var csvrow = [];
      for (var j = 0; j < cols.length; j++) {
        if (cols[j].nodeName === "INPUT") {
          if((cols[j] as HTMLInputElement).checked) {
            csvrow.push("x");
          }
          else {
            csvrow.push("");
          }
        }
        else {
          csvrow.push(cols[j].innerHTML.replace(/,/g, " "));
        }
      }
      csv_data.push(csvrow.join(","));
  }
  csv_data = csv_data.join('\n');
  
  var CSVFile = new Blob([csv_data], {
    type: "text/csv"
  });
  var temp_link = document.createElement('a');
  temp_link.download = `${clubName !== "" ? clubName.replace(/\s/g,"-").replace(/'/g,"") : "ReadingClub"}_Milestones.csv`;
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);
  temp_link.click();
  document.body.removeChild(temp_link);
}