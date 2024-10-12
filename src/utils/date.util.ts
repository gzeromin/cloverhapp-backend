export const isFuture = (date: Date) => {
  return date > new Date();
};

export const getPosition = (date: Date) => {
  const newDate = new Date(date);
  const hours = newDate.getHours();
  const minutes = newDate.getMinutes();

  // 시간 비율을 계산 (하루 24시간 기준)
  let positionY = hours - 4;
  if (positionY <= 0) {
    positionY = positionY + 24;
  }
  positionY = (positionY / 24) * 94;
  // 시간 비율을 계산 (한시간 60분 기준)
  const positionX = (minutes / 60) * 62;

  return { positionX, positionY };
};

export const getFirstDateOfWeek = (date: Date) => {
  const thisDate = date.getDate();
  const thisDay = date.getDay();

  // 선택된 날짜의 같은주 월요일 날짜
  const firstDate = thisDate - (thisDay - 1 < 0 ? 6 : thisDay - 1);

  // 리턴할 새로운 데이트 객체 생성
  const newDate = new Date(date);
  let newMonth = newDate.getMonth();
  // 월요일이 지난달인 경우
  if (thisDate - firstDate < 0) {
    newMonth -= 1;
  }
  newDate.setMonth(newMonth);
  newDate.setDate(firstDate);
  // 월요일 5시 0분 세팅
  newDate.setHours(5, 0, 0, 0); // 5시 0분, 초는 0, 밀리초는 0
  return newDate;
};

export const getLastDateOfWeek = (date: Date) => {
  const thisDate = date.getDate();
  const thisDay = date.getDay();

  // 선택된 날짜의 다음주 월요일 날짜 계산
  const lastDate = thisDate + (8 - thisDay);

  // 새로운 Date 객체를 생성하여 일요일 날짜로 설정
  const newDate = new Date(date);
  let newMonth = newDate.getMonth();

  // 일요일이 다음 달로 넘어가는 경우 처리
  if (lastDate > new Date(newDate.getFullYear(), newMonth + 1, 0).getDate()) {
    newMonth += 1;
  }

  newDate.setMonth(newMonth);
  newDate.setDate(lastDate);
  // 다음주 월요일 4시 59분 세팅
  newDate.setHours(4, 59, 0, 0); // 4시 59분, 초는 0, 밀리초는 0
  return newDate;
};
