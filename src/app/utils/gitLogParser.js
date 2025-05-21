import { formatDate } from '@/app/utils/date';

const scopePattern = /\((.*?)\):/;
const typePattern = /^([^\(:]+)(?:\([^)]*\))?:/;
const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;

export async function processLog(log, initialDate, endDate) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const processedLog = log
        .trim()
        .split('\n')
        .map((line) => {
          const date = line.match(dateTimePattern)?.[0];
          const dateIndex = line.indexOf(date);
          const dateLastIndex = dateIndex + date?.length;
          const hash = line.substring(0, 7);
          const author = line.substring(hash.length + 1, dateIndex - 1);
          const text = line.substring(dateLastIndex + 1);
          const scope = text.match(scopePattern)?.[1];
          const type = text.match(typePattern)?.[1];
          const subject = text.split(': ')?.[1];
          return { hash, author, scope, type, date, subject, text };
        })
        .filter((logItem) => {
          if (!logItem.date) return false;

          let passInitialDate = true;
          let passEndDate = true;
          const logDate = formatDate(logItem.date);

          if (initialDate) {
            passInitialDate = logDate >= initialDate;
          }

          if (endDate) {
            passEndDate = logDate <= endDate;
          }

          return passInitialDate && passEndDate;
        });
      resolve(processedLog);
    }, 1000);
  });
}

export function filterLog(formattedLog) {
  if (!formattedLog) return [];
  return formattedLog
    ?.filter((line) => !line.text.startsWith('Merge branch'))
    ?.filter((line) => !line.text.startsWith('Merged in'))
    ?.filter((line) => !line.text.startsWith('WIP'))
    ?.filter((line) => !line.text.startsWith('index'))
    ?.filter((line) => line.type)
    ?.filter((line) => line.subject);
}

export function getFeatures(filteredLog) {
  if (!filteredLog) return [];
  return filteredLog.filter((line) => line.type === 'feat');
}

export function getFixes(filteredLog) {
  if (!filteredLog) return [];
  return filteredLog.filter((line) => line.type === 'fix');
}
