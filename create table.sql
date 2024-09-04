CREATE TABLE `login_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
);


CREATE TABLE accountsuser (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usernameuser VARCHAR(255) NOT NULL 
);

INSERT INTO accountsuser (usernameuser) VALUES
('username1'),
('username2'),
('username3'),
('username4'),
('username5'),
('username6'),
('username7'),
('username8'),
('username9'),
('username10');

CREATE TABLE profil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) TEXT,
    usernameprofile VARCHAR(255) NOT NULL,
    imageProfile TEXT,
    caption TEXT,
    bio TEXT,
    UNIQUE (usernameprofile) 
);


CREATE TABLE `post` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `profileId` INT,
    `mediaPost` TEXT,
    `description` TEXT,
    `views` VARCHAR(255),
    `time` VARCHAR(255),
    `like` VARCHAR(255),
    `comment` VARCHAR(255),
    `repost` VARCHAR(255),
    `share` VARCHAR(255),
    FOREIGN KEY (`profileId`) REFERENCES `profil`(`id`)
);
