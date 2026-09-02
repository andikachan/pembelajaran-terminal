import { QuizQuestion } from '@/lib/types';
import { Language } from '@/lib/i18n/translations';

export interface LocalizedQuizContent {
  question: string;
  scenario?: string;
  commandSnippet?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-01',
    category: 'basics',
    level: 1,
    question: 'Manakah command yang digunakan untuk melihat koordinat path direktori yang sedang aktif saat ini?',
    scenario: 'Anda baru saja login ke server Linux dan ingin memastikan di folder mana Anda sedang berada.',
    options: [
      { id: 'a', text: 'pwd', isCorrect: true },
      { id: 'b', text: 'cd', isCorrect: false },
      { id: 'c', text: 'ls', isCorrect: false },
      { id: 'd', text: 'where', isCorrect: false },
    ],
    explanation: "'pwd' adalah singkatan dari Print Working Directory, yang menampilkan path absolut direktori aktif.",
    xpReward: 30,
  },
  {
    id: 'quiz-02',
    category: 'basics',
    level: 1,
    question: 'Bagaimana cara menampilkan daftar berkas termasuk berkas tersembunyi (diawali tanda titik)?',
    scenario: 'Anda mencurigai ada file konfigurasi tersembunyi seperti .bashrc atau .env di direktori saat ini.',
    options: [
      { id: 'a', text: 'ls -a', isCorrect: true },
      { id: 'b', text: 'ls -h', isCorrect: false },
      { id: 'c', text: 'dir --all', isCorrect: false },
      { id: 'd', text: 'show -hidden', isCorrect: false },
    ],
    explanation: "Flag '-a' (all) pada perintah 'ls' menginstruksikan shell untuk menampilkan semua node termasuk berkas titik tersembunyi.",
    xpReward: 30,
  },
  {
    id: 'quiz-03',
    category: 'files',
    level: 2,
    question: 'Perintah apa yang digunakan untuk membuat folder baru bernama "projects"?',
    scenario: 'Anda membutuhkan direktori baru untuk menyimpan skrip misi.',
    options: [
      { id: 'a', text: 'mkdir projects', isCorrect: true },
      { id: 'b', text: 'create projects', isCorrect: false },
      { id: 'c', text: 'touch projects', isCorrect: false },
      { id: 'd', text: 'folder projects', isCorrect: false },
    ],
    explanation: "'mkdir' (make directory) digunakan khusus untuk membuat direktori baru di Linux.",
    xpReward: 35,
  },
  {
    id: 'quiz-04',
    category: 'files',
    level: 2,
    question: 'Untuk membuat file kosong baru bernama "notes.txt", perintah mana yang paling tepat?',
    scenario: 'Anda ingin menginisialisasi file baru tanpa langsung mengisinya.',
    options: [
      { id: 'a', text: 'touch notes.txt', isCorrect: true },
      { id: 'b', text: 'cat notes.txt', isCorrect: false },
      { id: 'c', text: 'newfile notes.txt', isCorrect: false },
      { id: 'd', text: 'echo notes.txt', isCorrect: false },
    ],
    explanation: "Perintah 'touch' membuat file baru jika belum ada, atau memperbarui timestamp file jika sudah ada.",
    xpReward: 35,
  },
  {
    id: 'quiz-05',
    category: 'files',
    level: 2,
    question: 'Simbol apa yang digunakan untuk mengarahkan output terminal dan MENAMBAHKANNYA (append) ke akhir file tanpa menghapus isi lama?',
    commandSnippet: 'echo "baris baru" [simbol] log.txt',
    options: [
      { id: 'a', text: '>>', isCorrect: true },
      { id: 'b', text: '>', isCorrect: false },
      { id: 'c', text: '|', isCorrect: false },
      { id: 'd', text: '&', isCorrect: false },
    ],
    explanation: "'>>' melakukan append (menambah di akhir file), sedangkan '>' melakukan overwrite (menimpa seluruh isi file).",
    xpReward: 40,
  },
  {
    id: 'quiz-06',
    category: 'search',
    level: 3,
    question: 'Bagaimana cara mencari kata "CRITICAL" di dalam berkas server.log tanpa memedulikan huruf besar/kecil (case-insensitive)?',
    scenario: 'Anda menganalisis log error dan ingin menangkap "critical", "Critical", maupun "CRITICAL".',
    options: [
      { id: 'a', text: 'grep -i "CRITICAL" server.log', isCorrect: true },
      { id: 'b', text: 'find "CRITICAL" server.log', isCorrect: false },
      { id: 'c', text: 'search -case server.log "CRITICAL"', isCorrect: false },
      { id: 'd', text: 'cat server.log -f "CRITICAL"', isCorrect: false },
    ],
    explanation: "Flag '-i' (ignore case) pada 'grep' membuat pencarian pola tidak membedakan huruf besar maupun kecil.",
    xpReward: 40,
  },
  {
    id: 'quiz-07',
    category: 'search',
    level: 3,
    question: 'Fungsi utama dari karakter pipa / pipe (|) dalam shell Linux adalah...',
    options: [
      { id: 'a', text: 'Mengalirkan output dari perintah pertama sebagai input untuk perintah kedua', isCorrect: true },
      { id: 'b', text: 'Menghapus file sementara di latar belakang', isCorrect: false },
      { id: 'c', text: 'Membuat cadangan data direktori', isCorrect: false },
      { id: 'd', text: 'Menjalankan dua perintah secara bersamaan secara terpisah', isCorrect: false },
    ],
    explanation: "Pipe (|) menghubungkan STDOUT dari perintah di sebelah kiri langsung ke STDIN perintah di sebelah kanan.",
    xpReward: 45,
  },
  {
    id: 'quiz-08',
    category: 'inspection',
    level: 3,
    question: 'Untuk melihat hanya 5 baris TERAKHIR dari berkas log sistem yang sangat panjang, perintah apa yang efisien?',
    options: [
      { id: 'a', text: 'tail -n 5 /var/log/system.log', isCorrect: true },
      { id: 'b', text: 'head -n 5 /var/log/system.log', isCorrect: false },
      { id: 'c', text: 'last -5 /var/log/system.log', isCorrect: false },
      { id: 'd', text: 'wc -n 5 /var/log/system.log', isCorrect: false },
    ],
    explanation: "'tail' digunakan untuk membaca ekor / akhir dokumen. Sebaliknya, 'head' membaca kepala / awal dokumen.",
    xpReward: 40,
  },
  {
    id: 'quiz-09',
    category: 'process',
    level: 4,
    question: 'Jika sebuah proses dengan PID 142 mengalami crash atau hang, perintah apa yang digunakan untuk menghentikannya?',
    scenario: 'Layar monitoring menunjukkan PID 142 memakan resource CPU tanpa henti.',
    options: [
      { id: 'a', text: 'kill 142', isCorrect: true },
      { id: 'b', text: 'stop 142', isCorrect: false },
      { id: 'c', text: 'end 142', isCorrect: false },
      { id: 'd', text: 'exit 142', isCorrect: false },
    ],
    explanation: "'kill <PID>' mengirimkan sinyal terminasi (default SIGTERM / signal 15) kepada proses target di Linux.",
    xpReward: 45,
  },
  {
    id: 'quiz-10',
    category: 'superuser',
    level: 4,
    question: 'Di terminal Linux, apa tanda prompt default saat Anda beroperasi sebagai user biasa vs superuser (root)?',
    options: [
      { id: 'a', text: '$ untuk user biasa, dan # untuk superuser (root)', isCorrect: true },
      { id: 'b', text: '# untuk user biasa, dan $ untuk superuser (root)', isCorrect: false },
      { id: 'c', text: '> untuk user biasa, dan >> untuk superuser (root)', isCorrect: false },
      { id: 'd', text: '@ untuk user biasa, dan ! untuk superuser (root)', isCorrect: false },
    ],
    explanation: "Standar shell Unix/Linux menggunakan lambang '$' untuk akun reguler tanpa hak akses istimewa, dan '#' untuk akun root/administrator.",
    xpReward: 50,
  },
];

export const LOCALIZED_QUIZZES: Record<Language, Record<string, LocalizedQuizContent>> = {
  id: {
    'quiz-01': {
      question: 'Manakah command yang digunakan untuk melihat koordinat path direktori yang sedang aktif saat ini?',
      scenario: 'Anda baru saja login ke server Linux dan ingin memastikan di folder mana Anda sedang berada.',
      options: [
        { id: 'a', text: 'pwd', isCorrect: true },
        { id: 'b', text: 'cd', isCorrect: false },
        { id: 'c', text: 'ls', isCorrect: false },
        { id: 'd', text: 'where', isCorrect: false },
      ],
      explanation: "'pwd' adalah singkatan dari Print Working Directory, yang menampilkan path absolut direktori aktif.",
    },
    'quiz-02': {
      question: 'Bagaimana cara menampilkan daftar berkas termasuk berkas tersembunyi (diawali tanda titik)?',
      scenario: 'Anda mencurigai ada file konfigurasi tersembunyi seperti .bashrc atau .env di direktori saat ini.',
      options: [
        { id: 'a', text: 'ls -a', isCorrect: true },
        { id: 'b', text: 'ls -h', isCorrect: false },
        { id: 'c', text: 'dir --all', isCorrect: false },
        { id: 'd', text: 'show -hidden', isCorrect: false },
      ],
      explanation: "Flag '-a' (all) pada perintah 'ls' menginstruksikan shell untuk menampilkan semua node termasuk berkas titik tersembunyi.",
    },
    'quiz-03': {
      question: 'Perintah apa yang digunakan untuk membuat folder baru bernama "projects"?',
      scenario: 'Anda membutuhkan direktori baru untuk menyimpan skrip misi.',
      options: [
        { id: 'a', text: 'mkdir projects', isCorrect: true },
        { id: 'b', text: 'create projects', isCorrect: false },
        { id: 'c', text: 'touch projects', isCorrect: false },
        { id: 'd', text: 'folder projects', isCorrect: false },
      ],
      explanation: "'mkdir' (make directory) digunakan khusus untuk membuat direktori baru di Linux.",
    },
    'quiz-04': {
      question: 'Untuk membuat file kosong baru bernama "notes.txt", perintah mana yang paling tepat?',
      scenario: 'Anda ingin menginisialisasi file baru tanpa langsung mengisinya.',
      options: [
        { id: 'a', text: 'touch notes.txt', isCorrect: true },
        { id: 'b', text: 'cat notes.txt', isCorrect: false },
        { id: 'c', text: 'newfile notes.txt', isCorrect: false },
        { id: 'd', text: 'echo notes.txt', isCorrect: false },
      ],
      explanation: "Perintah 'touch' membuat file baru jika belum ada, atau memperbarui timestamp file jika sudah ada.",
    },
    'quiz-05': {
      question: 'Simbol apa yang digunakan untuk mengarahkan output terminal dan MENAMBAHKANNYA (append) ke akhir file tanpa menghapus isi lama?',
      commandSnippet: 'echo "baris baru" [simbol] log.txt',
      options: [
        { id: 'a', text: '>>', isCorrect: true },
        { id: 'b', text: '>', isCorrect: false },
        { id: 'c', text: '|', isCorrect: false },
        { id: 'd', text: '&', isCorrect: false },
      ],
      explanation: "'>>' melakukan append (menambah di akhir file), sedangkan '>' melakukan overwrite (menimpa seluruh isi file).",
    },
    'quiz-06': {
      question: 'Bagaimana cara mencari kata "CRITICAL" di dalam berkas server.log tanpa memedulikan huruf besar/kecil (case-insensitive)?',
      scenario: 'Anda menganalisis log error dan ingin menangkap "critical", "Critical", maupun "CRITICAL".',
      options: [
        { id: 'a', text: 'grep -i "CRITICAL" server.log', isCorrect: true },
        { id: 'b', text: 'find "CRITICAL" server.log', isCorrect: false },
        { id: 'c', text: 'search -case server.log "CRITICAL"', isCorrect: false },
        { id: 'd', text: 'cat server.log -f "CRITICAL"', isCorrect: false },
      ],
      explanation: "Flag '-i' (ignore case) pada 'grep' membuat pencarian pola tidak membedakan huruf besar maupun kecil.",
    },
    'quiz-07': {
      question: 'Fungsi utama dari karakter pipa / pipe (|) dalam shell Linux adalah...',
      options: [
        { id: 'a', text: 'Mengalirkan output dari perintah pertama sebagai input untuk perintah kedua', isCorrect: true },
        { id: 'b', text: 'Menghapus file sementara di latar belakang', isCorrect: false },
        { id: 'c', text: 'Membuat cadangan data direktori', isCorrect: false },
        { id: 'd', text: 'Menjalankan dua perintah secara bersamaan secara terpisah', isCorrect: false },
      ],
      explanation: "Pipe (|) menghubungkan STDOUT dari perintah di sebelah kiri langsung ke STDIN perintah di sebelah kanan.",
    },
    'quiz-08': {
      question: 'Untuk melihat hanya 5 baris TERAKHIR dari berkas log sistem yang sangat panjang, perintah apa yang efisien?',
      options: [
        { id: 'a', text: 'tail -n 5 /var/log/system.log', isCorrect: true },
        { id: 'b', text: 'head -n 5 /var/log/system.log', isCorrect: false },
        { id: 'c', text: 'last -5 /var/log/system.log', isCorrect: false },
        { id: 'd', text: 'wc -n 5 /var/log/system.log', isCorrect: false },
      ],
      explanation: "'tail' digunakan untuk membaca ekor / akhir dokumen. Sebaliknya, 'head' membaca kepala / awal dokumen.",
    },
    'quiz-09': {
      question: 'Jika sebuah proses dengan PID 142 mengalami crash atau hang, perintah apa yang digunakan untuk menghentikannya?',
      scenario: 'Layar monitoring menunjukkan PID 142 memakan resource CPU tanpa henti.',
      options: [
        { id: 'a', text: 'kill 142', isCorrect: true },
        { id: 'b', text: 'stop 142', isCorrect: false },
        { id: 'c', text: 'end 142', isCorrect: false },
        { id: 'd', text: 'exit 142', isCorrect: false },
      ],
      explanation: "'kill <PID>' mengirimkan sinyal terminasi (default SIGTERM / signal 15) kepada proses target di Linux.",
    },
    'quiz-10': {
      question: 'Di terminal Linux, apa tanda prompt default saat Anda beroperasi sebagai user biasa vs superuser (root)?',
      options: [
        { id: 'a', text: '$ untuk user biasa, dan # untuk superuser (root)', isCorrect: true },
        { id: 'b', text: '# untuk user biasa, dan $ untuk superuser (root)', isCorrect: false },
        { id: 'c', text: '> untuk user biasa, dan >> untuk superuser (root)', isCorrect: false },
        { id: 'd', text: '@ untuk user biasa, dan ! untuk superuser (root)', isCorrect: false },
      ],
      explanation: "Standar shell Unix/Linux menggunakan lambang '$' untuk akun reguler tanpa hak akses istimewa, dan '#' untuk akun root/administrator.",
    },
  },
  en: {
    'quiz-01': {
      question: 'Which command is used to display the active working directory path coordinate?',
      scenario: 'You just connected to a Linux server and need to confirm your active location in the hierarchy.',
      options: [
        { id: 'a', text: 'pwd', isCorrect: true },
        { id: 'b', text: 'cd', isCorrect: false },
        { id: 'c', text: 'ls', isCorrect: false },
        { id: 'd', text: 'where', isCorrect: false },
      ],
      explanation: "'pwd' stands for Print Working Directory, outputting the absolute path of the current directory.",
    },
    'quiz-02': {
      question: 'How do you list all files including hidden dotfiles (prefixed with .)?',
      scenario: 'You suspect hidden configuration files such as .bashrc or .env reside in the active directory.',
      options: [
        { id: 'a', text: 'ls -a', isCorrect: true },
        { id: 'b', text: 'ls -h', isCorrect: false },
        { id: 'c', text: 'dir --all', isCorrect: false },
        { id: 'd', text: 'show -hidden', isCorrect: false },
      ],
      explanation: "The '-a' (all) flag on 'ls' instructs the shell to display all entries including hidden dotfiles.",
    },
    'quiz-03': {
      question: 'Which command creates a new directory named "projects"?',
      scenario: 'You need an isolated folder to store operational scripts.',
      options: [
        { id: 'a', text: 'mkdir projects', isCorrect: true },
        { id: 'b', text: 'create projects', isCorrect: false },
        { id: 'c', text: 'touch projects', isCorrect: false },
        { id: 'd', text: 'folder projects', isCorrect: false },
      ],
      explanation: "'mkdir' (make directory) is specifically designed to forge new directories in Linux.",
    },
    'quiz-04': {
      question: 'To create an empty file named "notes.txt", which command is most suitable?',
      scenario: 'You want to initialize a target file without immediately opening a text editor.',
      options: [
        { id: 'a', text: 'touch notes.txt', isCorrect: true },
        { id: 'b', text: 'cat notes.txt', isCorrect: false },
        { id: 'c', text: 'newfile notes.txt', isCorrect: false },
        { id: 'd', text: 'echo notes.txt', isCorrect: false },
      ],
      explanation: "'touch' creates an empty file if it doesn't exist, or refreshes timestamps if it already exists.",
    },
    'quiz-05': {
      question: 'Which operator redirects terminal output and APPENDS it to the end of a file without overwriting?',
      commandSnippet: 'echo "new line" [operator] log.txt',
      options: [
        { id: 'a', text: '>>', isCorrect: true },
        { id: 'b', text: '>', isCorrect: false },
        { id: 'c', text: '|', isCorrect: false },
        { id: 'd', text: '&', isCorrect: false },
      ],
      explanation: "'>>' appends to the target file, whereas '>' overwrites the entire target file.",
    },
    'quiz-06': {
      question: 'How do you search for the token "CRITICAL" inside server.log ignoring case sensitivity?',
      scenario: 'You need to catch "critical", "Critical", and "CRITICAL" in a single query.',
      options: [
        { id: 'a', text: 'grep -i "CRITICAL" server.log', isCorrect: true },
        { id: 'b', text: 'find "CRITICAL" server.log', isCorrect: false },
        { id: 'c', text: 'search -case server.log "CRITICAL"', isCorrect: false },
        { id: 'd', text: 'cat server.log -f "CRITICAL"', isCorrect: false },
      ],
      explanation: "The '-i' (ignore case) flag on 'grep' makes pattern matching case-insensitive.",
    },
    'quiz-07': {
      question: 'What is the primary function of the pipe (|) operator in Linux shell?',
      options: [
        { id: 'a', text: 'Streams the standard output of the first command as input to the second command', isCorrect: true },
        { id: 'b', text: 'Deletes temporary background files', isCorrect: false },
        { id: 'c', text: 'Creates an automatic archive backup', isCorrect: false },
        { id: 'd', text: 'Executes two commands concurrently in the background', isCorrect: false },
      ],
      explanation: "A pipe (|) connects STDOUT from the left-hand command directly to STDIN of the right-hand command.",
    },
    'quiz-08': {
      question: 'To inspect only the last 5 lines of a huge system log file, which command is most efficient?',
      options: [
        { id: 'a', text: 'tail -n 5 /var/log/system.log', isCorrect: true },
        { id: 'b', text: 'head -n 5 /var/log/system.log', isCorrect: false },
        { id: 'c', text: 'last -5 /var/log/system.log', isCorrect: false },
        { id: 'd', text: 'wc -n 5 /var/log/system.log', isCorrect: false },
      ],
      explanation: "'tail' reads the tail end of a document. Conversely, 'head' reads from the top.",
    },
    'quiz-09': {
      question: 'If a rogue daemon with PID 142 hangs, which command terminates the process?',
      scenario: 'Telemetry indicates PID 142 is consuming CPU cycles uncontrollably.',
      options: [
        { id: 'a', text: 'kill 142', isCorrect: true },
        { id: 'b', text: 'stop 142', isCorrect: false },
        { id: 'c', text: 'end 142', isCorrect: false },
        { id: 'd', text: 'exit 142', isCorrect: false },
      ],
      explanation: "'kill <PID>' sends a termination signal (default SIGTERM 15) to the target process in Linux.",
    },
    'quiz-10': {
      question: 'In standard Linux terminals, what prompt symbols differentiate regular users from superuser (root)?',
      options: [
        { id: 'a', text: '$ for standard users, and # for root / superuser', isCorrect: true },
        { id: 'b', text: '# for standard users, and $ for root / superuser', isCorrect: false },
        { id: 'c', text: '> for standard users, and >> for root / superuser', isCorrect: false },
        { id: 'd', text: '@ for standard users, and ! for root / superuser', isCorrect: false },
      ],
      explanation: "Unix shell convention uses '$' for normal non-privileged user sessions and '#' for root administrative sessions.",
    },
  },
};
