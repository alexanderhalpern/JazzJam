export const getUserSchool = (data) => {
  if (data.user_grade !== "7th Grade" && data.user_grade !== "8th Grade") {
    return data.user_grade + " at " + data.user_school;
  } else {
    return data.user_grade + "r at " + data.user_school;
  }
};

export const getYearsPlayed = (data) => {
  if (parseInt(data.yearsPlayed) === 1) {
    return "1 year";
  } else {
    return data.yearsPlayed + " years";
  }
};
