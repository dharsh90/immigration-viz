setwd("~/Desktop/School/University_Washington/2016-2017/Spring/INFO_474/Homework/Programing/final/immigration-viz/data")
library(dplyr)

## Read in data
data_2 <- read.csv("./raw/fy2015_table2.csv", stringsAsFactors = FALSE, check.names = FALSE)
data_3 <- read.csv("./raw/fy2015_table3d.csv", stringsAsFactors = FALSE, check.names = FALSE)
data_4 <- read.csv("./raw/fy2015_table4.csv", stringsAsFactors = FALSE, check.names = FALSE)
data_11 <- read.csv("./raw/fy2015_table11d.csv", stringsAsFactors = FALSE, check.names = FALSE)
data_12 <- read.csv("./raw/fy2015_table12d.csv", stringsAsFactors = FALSE, check.names = FALSE)
codes <- read.csv("./raw/country_codes.csv", stringsAsFactors = FALSE, check.names = FALSE)
iso3 <- read.csv("./raw/iso3.csv", stringsAsFactors = FALSE, check.names = FALSE)


# Rename first columns
colnames(data_2)[1] <- "Country"
colnames(data_3)[1] <- "Country"
colnames(data_11)[1] <- "Country"
colnames(data_12)[1] <- "Country"
colnames(data_4)[1] <- "State"

# Remove numbs from row names
cleanRows <- function(vector) {
  new_row <- gsub("\\d+", '', vector)
  new_row <- gsub(",", '', new_row)
  new_row <- gsub("\\s+", '', new_row)
  new_row <- gsub("([a-z])([A-Z])", "\\1 \\2", new_row)
  return (new_row)
}

data_2[1] <- cleanRows(data_2$Country)
data_3[1] <- cleanRows(data_3$Country)
data_11[1] <- cleanRows(data_11$Country)
data_12[1] <- cleanRows(data_12$Country)
data_4[1] <- cleanRows(data_4$State)

# Remove nations and unspecified locations
removeRows <- function(df) {
  new_df <- df[!grepl("Other", df$Country),]
  new_df <- new_df[!grepl("Oceania", new_df$Country),]
  new_df <- new_df[!grepl("Asia", new_df$Country),]
  new_df <- new_df[!grepl("Not Specified", new_df$Country),]
  new_df <- new_df[!grepl("South America", new_df$Country),]
  new_df <- new_df[!grepl("Allothercountries", new_df$Country),]
  new_df <- new_df[!grepl("Unknown", new_df$Country),]
  return(new_df)

}
data_2 <- removeRows(data_2)
data_3 <- removeRows(data_3)
data_11 <- removeRows(data_11)
data_12 <- removeRows(data_12)


# convert to numerics 
convert <- function(df, total) {
  new_feat <- df[, 2: total]
  return(as.numeric(unlist(new_feat)))
}

data_2[ , 2:26] <- convert(data_2, 26)
data_3[ , 2:11] <- convert(data_3, 11)
data_4[ , 2:11] <- convert(data_4, 11)
data_11[ , 2:8] <- convert(data_2, 8)
data_12[ , 2:8] <- convert(data_2, 7)

country.names <- function(df) {
  old = c("Venezuela", "Bolivia", "Falkland Islands", "Bosnia", "Iran", "Vietnam", "Russia")
  new = c("Venezuela, Bolivarian Republic of", "Bolivia, Plurinational State of", 
          "Falkland Islands (Malvinas)", "Bosnia and Herzegovina", "Iran, Islamic Republic of",
          "Viet Nam", "Russian Federation")
  
  new_country <- gsub(old, new, df$Country)
  df$Country <- new_country
  df <- df %>% merge(iso3) %>% merge(codes)
  return(df)
}

colnames(iso3)[1] <- "ISO3"
colnames(codes)[2] <- "Country"
colnames(codes)[1] <- "ISO3116"
data_2 <- country.names(data_2)
data_3 <- country.names(data_3)
data_11 <- country.names(data_11)
data_12 <- country.names(data_12)


write.csv(data_2, "./prep/table_2.csv")
write.csv(data_3, "./prep/table_3.csv")
write.csv(data_4, "./prep/table_4.csv")
write.csv(data_11, "./prep/table_11.csv")
write.csv(data_12, "./prep/table_12.csv")
